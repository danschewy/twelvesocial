"use client";

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";

// Define a type for chat messages if not already in types/index.d.ts
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface SearchQueryItem {
  // Copied from UploadPage for context, consider shared types file
  id: string;
  queryText: string;
  searchOptions: string[];
}

interface SearchPromptData {
  // Copied from UploadPage for context
  searchQueries: SearchQueryItem[];
  notesForUser: string;
}

interface VideoAnalysis {
  insights: {
    contentType: string;
    estimatedClipCount: number;
  };
}

interface ChatInterfaceProps {
  videoId: string | null; // videoId can be null initially
  sessionId: string; // Added sessionId prop
  videoAnalysis?: VideoAnalysis | null; // Add video analysis prop
  onSearchPromptGenerated: (data: SearchPromptData) => void;
}

export default function ChatInterface({
  videoId,
  sessionId,
  videoAnalysis,
  onSearchPromptGenerated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasVideoContextBeenAdded, setHasVideoContextBeenAdded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial context message when video becomes available
  useEffect(() => {
    if (videoId && !hasVideoContextBeenAdded && videoAnalysis) {
      const contextMessage: Message = {
        id: `context-${Date.now()}`,
        text: `🎥 **Video Ready!** I've analyzed your video and found it's a **${videoAnalysis.insights.contentType}** with ${videoAnalysis.insights.estimatedClipCount} potential clips.

**Quick Actions:**
• "Create highlight reel" - Best moments
• "Find key quotes" - Important statements  
• "Break into clips" - Topic-based segments
• "Most engaging parts" - High-energy moments

Just tell me what type of clips you want and I'll generate them immediately!`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([contextMessage]);
      setHasVideoContextBeenAdded(true);
    } else if (videoId && !hasVideoContextBeenAdded && !videoAnalysis) {
      // Fallback message if analysis isn't available yet
      const contextMessage: Message = {
        id: `context-${Date.now()}`,
        text: `🎥 **Video Uploaded!** Your video is ready for clip generation. Tell me what type of clips you'd like to create:

**Examples:**
• "Create a highlight reel of the best moments"
• "Find all the key quotes and insights"  
• "Break this into topic-based clips"
• "Show me the most engaging parts"

What would you like to do with your video?`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([contextMessage]);
      setHasVideoContextBeenAdded(true);
    }
  }, [videoId, hasVideoContextBeenAdded, videoAnalysis]);

  // Reset context flag when video changes
  useEffect(() => {
    setHasVideoContextBeenAdded(false);
    setMessages([]); // Clear messages when video changes
  }, [videoId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId,
          videoId: videoId,
          videoAnalysis: videoAnalysis, // Pass video analysis to API
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      // Add bot response to messages
      const botMessage: Message = {
        id: data.reply.id || `bot-${Date.now()}`,
        text: data.reply.text,
        sender: "bot",
        timestamp: new Date(data.reply.timestamp),
      };

      setMessages((prev) => [...prev, botMessage]);

      // If search prompt data is provided, trigger the callback
      if (data.searchPromptData) {
        onSearchPromptGenerated(data.searchPromptData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
        {videoAnalysis && (
          <div className="text-sm text-gray-600">
            📊 {videoAnalysis.insights.contentType} • {videoAnalysis.insights.estimatedClipCount} clips
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !videoId && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Upload a video to start creating social media clips with AI assistance.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={
              videoId 
                ? "Tell me what clips you want to create..." 
                : "Upload a video first to start chatting..."
            }
            disabled={!videoId || isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !videoId || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
