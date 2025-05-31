"use client";

import VideoUploader from "@/components/VideoUploader";
import ChatInterface from "@/components/ChatInterface";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { VideoTask } from "@/lib/twelvelabs";

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

  const [indexedVideos, setIndexedVideos] = useState<VideoTask[] | null>(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);
  const [errorLoadingVideos, setErrorLoadingVideos] = useState<string | null>(
    null
  );
  const [selectedExistingVideo, setSelectedExistingVideo] =
    useState<VideoTask | null>(null);

  // State for video preview
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [selectedVideoHlsUrl, setSelectedVideoHlsUrl] = useState<string | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null); // For HLS if we use hls.js later

  useEffect(() => {
    // Generate a session ID when the component mounts
    setSessionId(uuidv4());
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      setErrorLoadingVideos(null);
      try {
        const response = await fetch("/api/list-videos");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.details || "Failed to fetch indexed videos"
          );
        }
        const data = await response.json();
        setIndexedVideos(data.data);
      } catch (error: any) {
        console.error("Error fetching indexed videos:", error);
        setErrorLoadingVideos(error.message);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  // Effect to create/revoke local preview URL for newly uploaded files
  useEffect(() => {
    if (uploadedVideoFile) {
      const url = URL.createObjectURL(uploadedVideoFile);
      setLocalPreviewUrl(url);
      setSelectedVideoHlsUrl(null); // Clear HLS url if new file is uploaded
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [uploadedVideoFile]);

  const handleVideoUploaded = (file: File, twelveLabsVideoId: string) => {
    setUploadedVideoFile(file);
    setVideoId(twelveLabsVideoId);
    setSelectedExistingVideo(null);
    setSelectedVideoHlsUrl(null); // Clear HLS URL
    console.log(
      "Newly uploaded video processed, Twelve Labs Video ID:",
      twelveLabsVideoId
    );
    setAiSearchPrompts(null);
    setEditableQueryText("");
  };

  const handleExistingVideoSelected = (videoTask: VideoTask) => {
    if (videoTask.video_id && videoTask.status === "ready") {
      setVideoId(videoTask.video_id);
      setSelectedExistingVideo(videoTask);
      setUploadedVideoFile(null); // Clear new upload state, which clears localPreviewUrl via useEffect
      setSelectedVideoHlsUrl(videoTask.hls?.video_url || null);
      console.log(
        "Existing video selected, Twelve Labs Video ID:",
        videoTask.video_id
      );
      if (!videoTask.hls?.video_url) {
        console.warn(
          "Selected existing video does not have an HLS stream URL for preview."
        );
      }
      setAiSearchPrompts(null);
      setEditableQueryText("");
    } else {
      console.warn(
        "Selected video task is not ready or has no video_id:",
        videoTask
      );
      alert(
        "This video is not yet ready or is invalid. Please select another."
      );
    }
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
      alert("Please upload or select a video first.");
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

  const currentVideoName =
    selectedExistingVideo?.metadata?.filename || uploadedVideoFile?.name;
  const videoPreviewSrc = localPreviewUrl || selectedVideoHlsUrl;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Upload Your Video & Define Your Clips
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white/10 p-6 rounded-lg flex flex-col gap-6 md:sticky md:top-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                1. Select or Upload Video
              </h2>
              <VideoUploader
                onVideoUploaded={handleVideoUploaded}
                videoPresent={!!(uploadedVideoFile || selectedExistingVideo)}
              />
            </div>

            {isLoadingVideos && (
              <p className="text-sm text-gray-300">
                Loading your indexed videos...
              </p>
            )}
            {errorLoadingVideos && (
              <p className="text-red-400">
                Error loading videos: {errorLoadingVideos}
              </p>
            )}

            {indexedVideos && indexedVideos.length > 0 && (
              <div className="mt-0">
                <h3 className="text-xl font-semibold mb-3">
                  Or choose an existing video:
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {indexedVideos
                    .filter((v) => v.status === "ready" && v.video_id)
                    .map((videoTask) => (
                      <button
                        key={videoTask._id}
                        onClick={() => handleExistingVideoSelected(videoTask)}
                        className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                          selectedExistingVideo?.video_id === videoTask.video_id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-700/50 hover:bg-gray-600/70"
                        }`}
                      >
                        {videoTask.hls?.thumbnail_urls?.[0] && (
                          <img
                            src={videoTask.hls.thumbnail_urls[0]}
                            alt="Thumbnail"
                            className="w-16 h-10 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-grow overflow-hidden">
                          <p
                            className="font-medium truncate"
                            title={
                              videoTask.metadata?.filename || videoTask._id
                            }
                          >
                            {videoTask.metadata?.filename ||
                              `Video ID: ${videoTask.video_id}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded:{" "}
                            {new Date(
                              videoTask.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
            {indexedVideos &&
              indexedVideos.length === 0 &&
              !isLoadingVideos && (
                <p className="text-gray-400 text-sm mt-2">
                  No ready videos found in your index. Upload one to get
                  started!
                </p>
              )}

            {videoId && (
              <div className="mt-4">
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
                        disabled={!editableQueryText.trim()}
                        className="w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                      >
                        Search Clips
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400 border border-dashed border-gray-600 rounded-md">
                    <p>
                      Chat with the AI to define what you're looking for in "
                      {currentVideoName || "your video"}".
                    </p>
                    <p className="text-sm">
                      Suggested search queries will appear here once generated.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/10 p-6 rounded-lg md:sticky md:top-8">
            <h2 className="text-2xl font-semibold mb-4">2. Preview & Chat</h2>

            {/* Video Preview Section */}
            <div className="mb-6 bg-black rounded aspect-video overflow-hidden">
              {videoPreviewSrc ? (
                <video
                  ref={videoRef}
                  src={videoPreviewSrc}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => console.error("Video player error:", e)}
                  onLoadedMetadata={() => console.log("Video metadata loaded")}
                  onCanPlay={() => console.log("Video can play")}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-gray-400">
                    Video preview will appear here.
                  </p>
                </div>
              )}
            </div>
            {selectedVideoHlsUrl && (
              <p className="text-xs text-gray-400 mb-4 text-center">
                Note: HLS video streaming might require specific browser support
                (e.g., Safari) or a dedicated HLS player for other browsers.
              </p>
            )}

            {sessionId ? (
              <ChatInterface
                videoId={videoId}
                sessionId={sessionId}
                onSearchPromptGenerated={handleSearchPromptGenerated}
                key={videoId || "no-video"}
              />
            ) : (
              <p className="text-center text-gray-300">Loading chat...</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
