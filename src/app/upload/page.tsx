"use client";

import VideoUploader from "@/components/VideoUploader";
import ChatInterface from "@/components/ChatInterface";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Define types for the search prompt data from the AI
interface SearchQueryItem {
  id: string;
  queryText: string;
  searchOptions: string[]; // e.g., ["visual", "conversation"]
}

interface SearchPromptData {
  searchQueries: SearchQueryItem[];
  notesForUser: string;
}

export default function UploadPage() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // State for AI-generated search prompts
  const [aiSearchPrompts, setAiSearchPrompts] =
    useState<SearchPromptData | null>(null);
  // State for the user-editable query text (could be an array if handling multiple edits)
  // For simplicity, let's start with editing the first query if multiple are returned.
  const [editableQueryText, setEditableQueryText] = useState<string>("");

  useEffect(() => {
    // Generate a session ID when the component mounts
    setSessionId(uuidv4());
  }, []);

  const handleVideoUploaded = (file: File, id: string) => {
    setUploadedVideoFile(file);
    setVideoId(id);
    console.log("Video processed, ID:", id);
    setAiSearchPrompts(null); // Clear any old prompts if a new video is uploaded
    setEditableQueryText("");
  };

  const handleSearchPromptGenerated = (data: SearchPromptData) => {
    setAiSearchPrompts(data);
    if (data.searchQueries && data.searchQueries.length > 0) {
      // Initialize the editable text with the first query's text
      setEditableQueryText(data.searchQueries[0].queryText);
    } else {
      setEditableQueryText("");
    }
  };

  const handleSearchClips = async () => {
    if (!videoId) {
      alert("Please upload and process a video first.");
      return;
    }
    if (
      !editableQueryText.trim() &&
      (!aiSearchPrompts || aiSearchPrompts.searchQueries.length === 0)
    ) {
      alert("No search query to use.");
      return;
    }

    const queryToSearch = editableQueryText.trim();
    // Assuming we use the searchOptions from the first AI-generated query if available,
    // or default to general search options. This needs refinement for multiple queries.
    const searchOptions = aiSearchPrompts?.searchQueries[0]?.searchOptions || [
      "visual",
      "conversation",
    ];

    console.log("Searching clips with:", {
      videoId,
      query: queryToSearch,
      options: searchOptions,
    });

    // Placeholder for calling /api/search-clips
    try {
      const response = await fetch("/api/search-clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, query: queryToSearch, searchOptions }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to search clips");
      }
      const results = await response.json();
      console.log("Search results:", results);
      alert(
        "Clips search initiated! Check console for results (actual display pending)."
      );
      // TODO: Process and display these results
    } catch (error) {
      console.error("Failed to search clips:", error);
      alert("Error searching clips: " + (error as Error).message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Upload Your Video & Define Your Clips
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white/10 p-6 rounded-lg flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Upload Video</h2>
              <VideoUploader
                onVideoUploaded={handleVideoUploaded}
                videoPresent={!!uploadedVideoFile}
              />
            </div>
            {/* Search Prompt Section - Always visible structure */}
            <div className="mt-0">
              <h2 className="text-2xl font-semibold mb-4">
                3. Refine & Search Clips
              </h2>
              {aiSearchPrompts &&
              aiSearchPrompts.searchQueries &&
              aiSearchPrompts.searchQueries.length > 0 ? (
                <>
                  {aiSearchPrompts.notesForUser && (
                    <p className="text-sm text-gray-300 mb-3 p-3 bg-gray-700/50 rounded-md">
                      <span className="font-semibold">AI Assistant:</span>{" "}
                      {aiSearchPrompts.notesForUser}
                    </p>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="searchQueryText"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Edit Search Query (for{" "}
                        <span className="font-mono text-xs bg-gray-700 p-0.5 rounded">
                          {aiSearchPrompts.searchQueries[0].searchOptions.join(
                            ", "
                          )}
                        </span>
                        ):
                      </label>
                      <textarea
                        id="searchQueryText"
                        rows={3}
                        value={editableQueryText}
                        onChange={(e) => setEditableQueryText(e.target.value)}
                        className="w-full p-2.5 bg-gray-700 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Enter your search query for Twelve Labs"
                      />
                    </div>
                    <button
                      onClick={handleSearchClips}
                      disabled={!videoId || !editableQueryText.trim()}
                      className="w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                    >
                      Search Clips
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray-400 border border-dashed border-gray-600 rounded-md">
                  <p>Chat with the AI to define what you're looking for.</p>
                  <p className="text-sm">
                    Suggested search queries will appear here once generated.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              2. Chat with AI Assistant
            </h2>
            {sessionId ? (
              <ChatInterface
                videoId={videoId}
                sessionId={sessionId}
                onSearchPromptGenerated={handleSearchPromptGenerated}
              />
            ) : (
              <p>Loading chat...</p> // Or some other loading indicator
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
