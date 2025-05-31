import { NextRequest, NextResponse } from "next/server";
import {
  chain,
  HumanMessage,
  AIMessage,
  ChatMessageHistory,
} from "@/lib/langchain";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

// A simple in-memory store for chat histories.
// In a production app, you'd replace this with a persistent store (e.g., Redis, a database).
const messageHistories: Record<string, ChatMessageHistory> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, videoId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required and must be an array." },
        { status: 400 }
      );
    }

    // Use videoId as the session ID for chat history. Fallback to a default if not provided.
    // In a real app, you'd want a more robust session management strategy.
    const sessionId = videoId || "default-session";

    // Get or create chat history for the session
    if (!messageHistories[sessionId]) {
      messageHistories[sessionId] = new ChatMessageHistory();
    }
    const currentMessageHistory = messageHistories[sessionId];

    // Reconstruct history from client, excluding the very last user message (which is the current input)
    // The `chainWithHistory` will add the last user message itself.
    // This ensures we don't duplicate the last user message in the history.
    // Also, convert client-side message format to LangChain message types.
    // Note: The initial bot messages sent from ChatInterface.tsx are not part of `messages` from client here,
    // they are only for display. The actual conversation starts with the user's first real message.
    // The SystemMessage is already part of the `chain`.

    // Clear existing history and rebuild from client messages *before* the latest user input.
    // This syncs the server-side history with the client's view, minus the latest input.
    await currentMessageHistory.clear();
    const historyMessagesForLangchain = messages
      .slice(0, -1) // Exclude the last message, which is the current input
      .map((msg: { sender: string; text: string }) => {
        if (msg.sender === "user") return new HumanMessage(msg.text);
        if (msg.sender === "bot") return new AIMessage(msg.text);
        return new HumanMessage(msg.text); // Fallback, should ideally not happen
      });

    for (const lcMessage of historyMessagesForLangchain) {
      await currentMessageHistory.addMessage(lcMessage);
    }

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain, // Your LangChain runnable (prompt + model)
      getMessageHistory: () => currentMessageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage.text;

    const result = await chainWithHistory.invoke(
      { input: userInput },
      { configurable: { sessionId } }
    );

    // The result from LangChain is an AIMessage content
    const botResponseText = result.content;

    // Add the AI's response to our history store *after* invocation
    await currentMessageHistory.addAIMessage(botResponseText as string);

    return NextResponse.json({
      reply: {
        id: `bot-${Date.now()}`,
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: "Failed to get chat response", details: errorMessage },
      { status: 500 }
    );
  }
}
