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

interface ChatInterfaceProps {
  videoId: string | null; // videoId can be null initially
  sessionId: string; // Added sessionId prop
  onSearchPromptGenerated: (data: SearchPromptData) => void; // Added prop
}

export default function ChatInterface({
  videoId,
  sessionId,
  onSearchPromptGenerated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial bot message with guiding questions - more conversational
    setMessages([
      {
        id: "init-1",
        text: "Hi! I'm here to help you create amazing social media clips from your video. 🎬",
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "init-2",
        text: "What kind of clips are you looking to create? For example:\n• Highlight reel of the best moments\n• Clips focused on specific topics\n• Breaking down a tutorial into steps\n• Showcasing different segments",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (videoId) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `system-videoid-${Date.now()}`,
          text: `Perfect! Your video is ready for analysis. What would you like me to help you find? 🔍`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [videoId]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only the current message, sessionId, and videoId (if available)
        body: JSON.stringify({ message: input.trim(), sessionId, videoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch chat response");
      }

      const data = await response.json();
      const botResponseMessage: Message = data.reply;

      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, botResponseMessage]);

      // If AI returned search prompt data, call the callback
      if (data.searchPromptData) {
        onSearchPromptGenerated(data.searchPromptData);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setIsTyping(false);
      
      let errorText = "I'm having trouble connecting right now. Please check your internet connection and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorText = "It looks like there's an issue with the AI configuration. Please make sure your OpenAI API key is set up correctly.";
        } else if (error.message.includes("rate limit")) {
          errorText = "I'm getting too many requests right now. Please wait a moment and try again.";
        } else {
          errorText = `Sorry, I encountered an error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-gray-700 text-gray-200">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px] bg-gray-800/50 rounded-lg shadow-xl border border-gray-700">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              videoId
                ? "Ask about your video..."
                : "Tell me about your video and what clips you want..."
            }
            disabled={isLoading}
            className="flex-grow px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
