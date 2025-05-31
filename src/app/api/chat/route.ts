import { NextRequest, NextResponse } from "next/server";
import { chain, ChatMessageHistory } from "@/lib/langchain";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getManualIndexId, getVideoDetails } from "@/lib/twelvelabs.server";

// A simple in-memory store for chat histories.
// In a production app, you'd replace this with a persistent store (e.g., Redis, a database).
const messageHistories: Record<string, ChatMessageHistory> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, videoId, videoAnalysis } = body;

    // Enhanced validation
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string." },
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
    const currentSessionKey = sessionId;

    // Get or create chat history for the session
    if (!messageHistories[currentSessionKey]) {
      messageHistories[currentSessionKey] = new ChatMessageHistory();
    }
    const currentMessageHistory = messageHistories[currentSessionKey];

    // Only add the new user message to history (don't clear and reconstruct)
    // The history should persist across requests
    const userInput = message.trim();

    // Check for empty input after trimming
    if (!userInput) {
      return NextResponse.json({
        reply: {
          id: `bot-${Date.now()}`,
          text: "I didn't receive any message. Could you please try again?",
          sender: "bot",
          timestamp: new Date(),
        },
        searchPromptData: null,
      });
    }

    // Add the current user message to history
    await currentMessageHistory.addUserMessage(userInput);

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => currentMessageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Prepare the input with comprehensive video context
    const chainInput: {
      input: string;
      video_context: string;
    } = {
      input: userInput,
      video_context: "",
    };

    // Add comprehensive video context if videoId is provided
    if (videoId) {
      try {
        console.log(`Fetching comprehensive video context for: ${videoId}`);
        const indexId = await getManualIndexId();
        const videoDetails = await getVideoDetails(indexId, videoId);
        
        // Create rich video context with analysis data
        const videoContext = {
          video_id: videoId,
          filename: videoDetails.system_metadata?.filename || "Unknown",
          duration: videoDetails.system_metadata?.duration || 0,
          width: videoDetails.system_metadata?.width || 0,
          height: videoDetails.system_metadata?.height || 0,
          status: videoDetails.status,
          created_at: videoDetails.created_at,
          indexed_at: videoDetails.indexed_at,
        };

        let contextString = `VIDEO CONTEXT:
- Video ID: ${videoContext.video_id}
- Filename: ${videoContext.filename}
- Duration: ${Math.round(videoContext.duration)} seconds (${Math.floor(videoContext.duration / 60)}:${String(Math.round(videoContext.duration % 60)).padStart(2, '0')})
- Resolution: ${videoContext.width}x${videoContext.height}
- Status: ${videoContext.status}
- Uploaded: ${new Date(videoContext.created_at).toLocaleDateString()}
- Indexed: ${videoContext.indexed_at ? new Date(videoContext.indexed_at).toLocaleDateString() : 'Processing'}

This video has been successfully uploaded and indexed by Twelve Labs and is ready for analysis and clip generation.`;

        // Add video analysis context if available
        if (videoAnalysis) {
          contextString += `

VIDEO ANALYSIS:
- Content Type: ${videoAnalysis.insights.contentType}
- Key Topics: ${videoAnalysis.insights.keyTopics.join(', ') || 'None identified'}
- Has Quotes: ${videoAnalysis.insights.hasQuotes ? 'Yes' : 'No'}
- Has Visual Elements: ${videoAnalysis.insights.hasVisualElements ? 'Yes' : 'No'}
- Estimated Clip Count: ${videoAnalysis.insights.estimatedClipCount}

SUGGESTED CLIP TYPES:
${videoAnalysis.insights.suggestedClips.map((clip: string, index: number) => `${index + 1}. ${clip}`).join('\n')}

VIDEO SUMMARY:
${videoAnalysis.summary}

IMPORTANT: Use this analysis to immediately generate search queries for common requests like "highlight reel", "best moments", "key quotes", etc. Don't ask clarifying questions unless the request is truly ambiguous.`;
        }

        chainInput.video_context = contextString;
        console.log("Comprehensive video context prepared with analysis data");
      } catch (error) {
        console.warn("Failed to fetch video details for context:", error);
        // Fallback to basic context
        chainInput.video_context = `VIDEO CONTEXT:
- Video ID: ${videoId}
- Status: Ready for analysis
- This video has been uploaded and is ready for clip generation.`;
      }
    } else {
      chainInput.video_context = "No video uploaded yet. User needs to upload a video first before we can generate clips.";
    }

    const result = await chainWithHistory.invoke(chainInput, {
      configurable: { sessionId: currentSessionKey },
    });

    // The result from LangChain is an AIMessage content
    const botResponseText = result.content as string;

    // Enhanced JSON parsing with better error handling
    let searchPromptData = null;
    let plainTextReply = botResponseText;

    // Look for JSON code blocks
    const jsonRegex = /```json\s*\n([\s\S]*?)\n\s*```/;
    const jsonMatch = botResponseText.match(jsonRegex);

    if (jsonMatch && jsonMatch[1]) {
      try {
        const jsonString = jsonMatch[1].trim();
        searchPromptData = JSON.parse(jsonString);

        // Validate the JSON structure
        if (
          searchPromptData &&
          searchPromptData.searchQueries &&
          Array.isArray(searchPromptData.searchQueries) &&
          searchPromptData.searchQueries.length > 0
        ) {
          // Use notesForUser as the plain text reply if available
          if (searchPromptData.notesForUser) {
            plainTextReply = searchPromptData.notesForUser;
          } else {
            plainTextReply =
              "I've prepared some search queries for you. Let me know if you'd like to adjust them!";
          }

          // Remove the JSON block from the original response if it exists
          plainTextReply =
            botResponseText.replace(jsonRegex, "").trim() || plainTextReply;
        } else {
          // Invalid JSON structure, treat as regular response
          console.warn(
            "AI returned JSON with invalid structure:",
            searchPromptData
          );
          searchPromptData = null;
        }
      } catch (e) {
        console.warn(
          "AI returned a JSON-like block, but it failed to parse:",
          e
        );
        searchPromptData = null;
        // Keep the original response including the malformed JSON
      }
    }

    // Add the AI's response to history
    await currentMessageHistory.addAIMessage(plainTextReply);

    return NextResponse.json({
      reply: {
        id: `bot-${Date.now()}`,
        text: plainTextReply,
        sender: "bot",
        timestamp: new Date(),
      },
      searchPromptData: searchPromptData,
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);

    let errorMessage =
      "I'm experiencing some technical difficulties. Please try again in a moment.";
    let statusCode = 500;

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("API key")) {
        errorMessage =
          "There's an issue with the AI service configuration. Please contact support.";
        statusCode = 503;
      } else if (error.message.includes("rate limit")) {
        errorMessage =
          "I'm receiving too many requests right now. Please wait a moment and try again.";
        statusCode = 429;
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "The request took too long to process. Please try again.";
        statusCode = 408;
      } else if (error.message.includes("network")) {
        errorMessage =
          "I'm having trouble connecting to the AI service. Please check your connection and try again.";
        statusCode = 503;
      }
    }

    return NextResponse.json(
      {
        error: "Chat service temporarily unavailable",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
