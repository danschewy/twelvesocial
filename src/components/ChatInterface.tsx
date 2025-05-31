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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial bot message with guiding questions
    // These messages will appear before a videoId is available
    setMessages([
      {
        id: "init-1",
        text: "Thanks for uploading your video! To help me create the best social media clips, could you tell me a bit about its content and what you're hoping to achieve?",
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "init-2",
        text: "Are you looking for specific moments or themes, or do you want to break it down into different sections?",
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "init-3",
        text: "For example, are you trying to:\nA. Highlight specific actions or topics (e.g., 'best moments', 'mentions of X')?\nB. Showcase different topics, segments, or categories from the video (e.g., 'different services offered', 'product features', 'parts of a project', 'event agenda items')?\nC. Break down a 'how-to' or tutorial video into sequential steps (e.g., 'step 1', 'step 2')?",
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
          text: `Video ready for analysis (ID: ${videoId}). How can I help you with it?`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } else {
      // Potentially clear or reset chat if videoId becomes null after being set
      // For now, we just add the initial messages once.
    }
  }, [videoId]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the current messages array, sessionId, and videoId (if available)
        body: JSON.stringify({ messages: newMessages, sessionId, videoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch chat response");
      }

      const data = await response.json();
      const botResponseMessage: Message = data.reply;

      setMessages((prevMessages) => [...prevMessages, botResponseMessage]);

      // If AI returned search prompt data, call the callback
      if (data.searchPromptData) {
        onSearchPromptGenerated(data.searchPromptData);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorText =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error. Please try again.";
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px] bg-gray-800/50 rounded-lg shadow-xl">
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
                : "How can I help you create video clips?"
            }
            disabled={isLoading}
            className="flex-grow px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
