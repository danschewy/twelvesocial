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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts for quick actions
  const suggestedPrompts = [
    "Create highlight reel",
    "Find key quotes", 
    "Break into clips",
    "Most engaging parts"
  ];

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial context message when video becomes available - FASTER LOADING
  useEffect(() => {
    console.log('ChatInterface: useEffect triggered with:', { 
      videoId, 
      hasVideoContextBeenAdded, 
      messagesLength: messages.length 
    });
    
    if (videoId && !hasVideoContextBeenAdded) {
      console.log('ChatInterface: Adding immediate message for videoId:', videoId);
      
      // Send immediate message when video is uploaded
      const immediateMessage: Message = {
        id: `immediate-${Date.now()}`,
        text: `🎥 **Video Uploaded Successfully!** 

I'm analyzing your video now to understand its content and find the best moments for clips. This will just take a moment...

While I work on that, you can tell me what type of clips you'd like to create:

**Popular Options:**
• "Create highlight reel" - Best moments
• "Find key quotes" - Important statements  
• "Break into clips" - Topic-based segments
• "Most engaging parts" - High-energy moments

What would you like to do with your video?`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      console.log('ChatInterface: Setting messages to:', [immediateMessage]);
      setMessages([immediateMessage]);
      setHasVideoContextBeenAdded(true);
      setShowSuggestions(true); // Show suggestions immediately
      console.log('ChatInterface: Immediate message added, hasVideoContextBeenAdded set to true');
    }
  }, [videoId, hasVideoContextBeenAdded, messages.length]);

  // Update message when video analysis is complete
  useEffect(() => {
    if (videoId && hasVideoContextBeenAdded && videoAnalysis && videoAnalysis.insights) {
      console.log('ChatInterface: Adding analysis complete message');
      // Add analysis results message
      const analysisMessage: Message = {
        id: `analysis-${Date.now()}`,
        text: `✅ **Analysis Complete!** I've analyzed your video and found it's a **${videoAnalysis.insights.contentType}** with ${videoAnalysis.insights.estimatedClipCount} potential clips.

**Ready to create clips!** Just tell me what you&apos;re looking for and I&apos;ll generate the perfect search queries.`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, analysisMessage]);
    }
  }, [videoAnalysis, videoId, hasVideoContextBeenAdded]);

  // Reset context flag when video changes - but preserve the immediate message logic
  useEffect(() => {
    console.log('ChatInterface: Reset effect triggered for videoId:', videoId);
    // Only reset if we're switching to a different video or clearing video
    if (!videoId) {
      console.log('ChatInterface: Clearing messages and resetting state');
      setHasVideoContextBeenAdded(false);
      setMessages([]); // Clear messages when video is cleared
      setShowSuggestions(false);
    }
  }, [videoId]);

  // Handle suggestion click with auto-send
  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false); // Hide suggestions after clicking
    
    // Auto-send the suggestion
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: suggestion,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: suggestion,
          sessionId: sessionId,
          videoId: videoId,
          videoAnalysis: videoAnalysis,
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
      setInputValue(""); // Clear input after auto-send
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setShowSuggestions(false); // Hide suggestions when user types

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
    // Hide suggestions when user starts typing
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    }
  };

  // Debug logging for render
  console.log('ChatInterface: Rendering with state:', { 
    messagesLength: messages.length, 
    videoId, 
    hasVideoContextBeenAdded,
    showSuggestions 
  });

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 rounded-t-lg">
        <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
        {videoAnalysis && videoAnalysis.insights && (
          <div className="text-sm text-gray-300">
            📊 {videoAnalysis.insights.contentType} • {videoAnalysis.insights.estimatedClipCount} clips
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !videoId && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Upload a video to start creating social media clips with AI assistance.</p>
          </div>
        )}

        {messages.length === 0 && videoId && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">🤔 No messages yet</p>
            <p>Debug: videoId={videoId}, hasVideoContextBeenAdded={hasVideoContextBeenAdded}</p>
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
                  ? "bg-[hsl(280,100%,70%)] text-white"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-white/80" : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Clickable Suggestion Buttons */}
        {showSuggestions && videoId && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(prompt)}
                className="px-3 py-2 bg-[hsl(280,100%,70%)]/20 hover:bg-[hsl(280,100%,70%)]/30 border border-[hsl(280,100%,70%)]/40 text-white rounded-full text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:ring-offset-2 focus:ring-offset-transparent"
              >
                ✨ {prompt}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white p-3 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[hsl(280,100%,70%)]"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
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
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !videoId || isLoading}
            className="px-4 py-2 bg-[hsl(280,100%,70%)] text-white rounded-md hover:bg-[hsl(280,100%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:ring-offset-2 focus:ring-offset-transparent disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
