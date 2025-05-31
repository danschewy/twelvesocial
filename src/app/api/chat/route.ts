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
    const { messages, sessionId, videoId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required and must be an array." },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    // Use the provided sessionId for chat history.
    // If videoId is also present, it can be used by the LangChain agent for context,
    // but the history store will be keyed by sessionId.
    const currentSessionKey = sessionId;

    // Get or create chat history for the session
    if (!messageHistories[currentSessionKey]) {
      messageHistories[currentSessionKey] = new ChatMessageHistory();
    }
    const currentMessageHistory = messageHistories[currentSessionKey];

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
      {
        input: userInput,
        // Pass videoId to the chain if available, so the AI knows about it
        // The specific key here ('videoId') depends on how your LangChain prompt/chain expects it.
        // For now, let's assume the prompt can implicitly use it or you'll modify chain to accept it.
        ...(videoId && { video_id_for_context: videoId }),
      },
      { configurable: { sessionId: currentSessionKey } } // Pass sessionKey to LangChain for history
    );

    // The result from LangChain is an AIMessage content
    const botResponseText = result.content as string;

    // Attempt to parse the response as JSON if it looks like a JSON code block
    let searchPromptData = null;
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const jsonMatch = botResponseText.match(jsonRegex);

    let plainTextReply = botResponseText;

    if (jsonMatch && jsonMatch[1]) {
      try {
        searchPromptData = JSON.parse(jsonMatch[1]);
        // If JSON is successfully parsed, we might want to use the 'notesForUser' as the plain text reply
        // or send a generic message like "I've prepared some search queries for you."
        if (searchPromptData && searchPromptData.notesForUser) {
          plainTextReply = searchPromptData.notesForUser;
        } else {
          plainTextReply =
            "I've prepared some search queries for you. Please review them.";
        }
        // The AI might still include the JSON block in its textual reply.
        // We can choose to remove it from plainTextReply if desired, but for now, let's assume `notesForUser` is the primary textual response in this case.
      } catch (e) {
        console.warn(
          "AI returned a JSON-like block, but it failed to parse:",
          e
        );
        // Fallback to using the full botResponseText if JSON parsing fails
        searchPromptData = null; // Ensure it's null if parsing failed
        plainTextReply = botResponseText;
      }
    }

    // Add the AI's (potentially modified) plain text response to history
    await currentMessageHistory.addAIMessage(plainTextReply);

    return NextResponse.json({
      reply: {
        id: `bot-${Date.now()}`,
        text: plainTextReply, // Send the plain text part of the reply
        sender: "bot",
        timestamp: new Date(),
      },
      searchPromptData: searchPromptData, // This will be null if no valid JSON was found/parsed
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
