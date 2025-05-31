"use client";

import VideoUploader from "@/components/VideoUploader";
import ChatInterface from "@/components/ChatInterface";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  VideoTask,
  SearchClipData,
  VideoDetails as VideoDetailsType,
} from "@/lib/twelvelabs";
import Image from "next/image"; // Import Next.js Image component
import Hls from "hls.js"; // Import Hls.js

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

// Add GeneratedClipInfo interface here
interface GeneratedClipInfo {
  id?: string;
  fileName: string;
  downloadUrl: string;
  message: string;
  error?: string;
}

export default function UploadPage() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  // State for clip generation
  const [selectedClips, setSelectedClips] = useState<SearchClipData[]>([]);
  const [isGeneratingClips, setIsGeneratingClips] = useState<boolean>(false);
  const [generatedClipResults, setGeneratedClipResults] = useState<
    GeneratedClipInfo[] | null
  >(null);
  const [clipGenerationError, setClipGenerationError] = useState<string | null>(
    null
  );
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null); // Ref to store Hls instance

  // State for search results
  const [searchResults, setSearchResults] = useState<SearchClipData[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFetchingVideoDetails, setIsFetchingVideoDetails] =
    useState<boolean>(false);

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
      } catch (error: unknown) {
        console.error("Error fetching indexed videos:", error);
        if (error instanceof Error) {
          setErrorLoadingVideos(error.message);
        } else {
          setErrorLoadingVideos(
            "An unknown error occurred while fetching videos."
          );
        }
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

  // Effect for handling HLS playback
  useEffect(() => {
    if (videoRef.current && selectedVideoHlsUrl) {
      if (Hls.isSupported()) {
        console.log(
          "HLS.js is supported. Initializing HLS player for:",
          selectedVideoHlsUrl
        );
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(selectedVideoHlsUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, attempting to play.");
          videoRef.current
            ?.play()
            .catch((e) => console.warn("Autoplay prevented or failed:", e));
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error("HLS.js error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error(
                  "Fatal network error encountered, trying to recover..."
                );
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error(
                  "Fatal media error encountered, trying to recover..."
                );
                hls.recoverMediaError();
                break;
              default:
                console.error(
                  "An unrecoverable HLS error occurred. Destroying HLS instance."
                );
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        console.log(
          "HLS.js not supported, but native HLS playback might be available (e.g., Safari). Setting src directly."
        );
        videoRef.current.src = selectedVideoHlsUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current
            ?.play()
            .catch((e) =>
              console.warn("Autoplay prevented or failed (native HLS):", e)
            );
        });
      } else {
        console.warn(
          "HLS.js is not supported and native HLS playback is not available. HLS stream may not play."
        );
      }
    } else if (videoRef.current && localPreviewUrl) {
      // Fallback for local preview URL
      console.log("Setting video src to local preview URL:", localPreviewUrl);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoRef.current.src = localPreviewUrl;
    } else if (videoRef.current) {
      // Clear src if no HLS and no local preview
      console.log("No HLS or local preview URL. Clearing video src.");
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoRef.current.removeAttribute("src");
      videoRef.current.load(); // Reset video element state
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        console.log("Destroying HLS instance on cleanup.");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedVideoHlsUrl, localPreviewUrl]); // Re-run when HLS URL or local preview URL changes

  const resetSearchState = () => {
    setAiSearchPrompts(null);
    setEditableQueryText("");
    setSearchResults(null);
    setIsSearching(false);
    setSearchError(null);
  };

  // Reset more states when video changes
  const resetAllClipStates = () => {
    resetSearchState();
    setSelectedClips([]);
    setIsGeneratingClips(false);
    setGeneratedClipResults(null);
    setClipGenerationError(null);
  };

  const handleVideoUploaded = async (file: File, twelveLabsVideoId: string) => {
    setVideoId(twelveLabsVideoId);
    setSelectedExistingVideo(null);
    resetAllClipStates();
    console.log(
      "Newly uploaded video processed by Twelve Labs. Video ID:",
      twelveLabsVideoId
    );
    console.log("Attempting to fetch HLS stream for preview...");
    setIsFetchingVideoDetails(true);
    try {
      const response = await fetch(`/api/video-details/${twelveLabsVideoId}`);
      if (!response.ok) {
        let errorMsg = "Failed to fetch video details from API.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.details || errorData.message || errorMsg;
        } catch (e) {
          // If parsing errorData fails, use the original errorMsg or response statusText
          errorMsg = response.statusText || errorMsg || (e as string);
        }
        throw new Error(errorMsg);
      }
      const details: VideoDetailsType = await response.json();

      if (details.hls?.video_url) {
        setSelectedVideoHlsUrl(details.hls.video_url);
        setUploadedVideoFile(null);
        console.log(
          "HLS stream URL fetched and set for preview:",
          details.hls.video_url
        );
      } else {
        console.warn(
          "Video processed, but HLS stream URL not found in details. Will rely on local preview if available, or list selection."
        );
        setUploadedVideoFile(file);
      }
    } catch (error) {
      console.error("Error fetching video details for HLS stream:", error);
      setUploadedVideoFile(file);
      setErrorLoadingVideos(
        "Could not load HLS stream for preview. Using local file if possible."
      );
    } finally {
      setIsFetchingVideoDetails(false);
    }
  };

  const handleExistingVideoSelected = async (videoTask: VideoTask) => {
    if (videoTask.video_id && videoTask.status === "ready") {
      setVideoId(videoTask.video_id);
      setSelectedExistingVideo(videoTask);
      setUploadedVideoFile(null);
      setSelectedVideoHlsUrl(null); // Clear any previous HLS URL immediately
      resetAllClipStates();
      console.log(
        "Existing video selected, Twelve Labs Video ID:",
        videoTask.video_id
      );
      console.log(
        "Attempting to fetch HLS stream for selected existing video..."
      );
      setIsFetchingVideoDetails(true); // Reuse existing loading state
      try {
        const response = await fetch(
          `/api/video-details/${videoTask.video_id}`
        );
        if (!response.ok) {
          let errorMsg = "Failed to fetch video details for selected video.";
          try {
            const errorData = await response.json();
            errorMsg = errorData.details || errorData.message || errorMsg;
          } catch (e) {
            errorMsg = response.statusText || errorMsg || (e as string);
          }
          throw new Error(errorMsg);
        }
        const details: VideoDetailsType = await response.json();
        if (details.hls?.video_url) {
          setSelectedVideoHlsUrl(details.hls.video_url);
          console.log(
            "HLS stream URL fetched and set for selected existing video:",
            details.hls.video_url
          );
        } else {
          console.warn(
            "HLS stream URL not found in details for selected existing video."
          );
          // Potentially set an error or notification for the user here if preview is expected
          setErrorLoadingVideos(
            `Video selected, but no HLS stream is available for preview (${
              videoTask.system_metadata?.filename || videoTask.video_id
            }).`
          );
        }
      } catch (error) {
        console.error(
          "Error fetching video details for selected existing video:",
          error
        );
        if (error instanceof Error) {
          setErrorLoadingVideos(
            `Could not load HLS stream for preview: ${error.message}`
          );
        } else {
          setErrorLoadingVideos(
            "An unknown error occurred while fetching HLS stream for selected video."
          );
        }
      } finally {
        setIsFetchingVideoDetails(false);
      }
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
    setSearchResults(null); // Clear previous results when new prompts are generated
    setSearchError(null);
    setSelectedClips([]); // Clear selections when new prompts/searches happen
    setGeneratedClipResults(null);
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

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

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
      console.log("Search results received:", results);
      if (results.data) {
        setSearchResults(results.data);
        setSelectedClips([]); // Clear selections if search is re-run
        setGeneratedClipResults(null);
        setClipGenerationError(null);
      } else {
        setSearchResults([]); // Should ideally not happen if API is consistent
        console.warn("Search API returned success but no data field.");
      }
    } catch (error: unknown) {
      console.error("Failed to search clips:", error);
      if (error instanceof Error) {
        setSearchError(error.message);
      } else {
        setSearchError("An unknown error occurred during search.");
      }
      setSearchResults([]); // Ensure results are cleared on error
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleClipSelection = (clip: SearchClipData) => {
    setSelectedClips((prevSelected) => {
      if (
        prevSelected.find(
          (sc) =>
            sc.start === clip.start &&
            sc.end === clip.end &&
            sc.video_id === clip.video_id
        )
      ) {
        return prevSelected.filter(
          (sc) =>
            !(
              sc.start === clip.start &&
              sc.end === clip.end &&
              sc.video_id === clip.video_id
            )
        );
      } else {
        return [...prevSelected, clip];
      }
    });
  };

  const handleGenerateClips = async () => {
    if (!videoId || selectedClips.length === 0) {
      alert("Please select a video and at least one clip to generate.");
      return;
    }
    setIsGeneratingClips(true);
    setGeneratedClipResults(null);
    setClipGenerationError(null);

    const segmentsToGenerate = selectedClips.map((clip) => ({
      id: `${clip.video_id}_${clip.start}_${clip.end}`, // Create a unique-ish ID for tracking if needed
      start: clip.start,
      end: clip.end,
    }));

    try {
      const response = await fetch("/api/generate-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, segments: segmentsToGenerate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.message ||
            "Failed to start clip generation"
        );
      }
      const result = await response.json();
      setGeneratedClipResults(result.data);
      if (result.data.some((clip: GeneratedClipInfo) => clip.error)) {
        setClipGenerationError(
          "Some clips could not be generated. Check details below."
        );
      }
    } catch (error: unknown) {
      console.error("Error generating clips:", error);
      if (error instanceof Error) {
        setClipGenerationError(error.message);
      } else {
        setClipGenerationError(
          "An unknown error occurred during clip generation."
        );
      }
    } finally {
      setIsGeneratingClips(false);
    }
  };

  const currentVideoName =
    selectedExistingVideo?.system_metadata?.filename || uploadedVideoFile?.name;
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
                          <Image
                            src={videoTask.hls.thumbnail_urls[0]}
                            alt="Thumbnail"
                            width={64} // w-16 equivalent for 4px base = 16*4 = 64px. Assuming 1rem = 16px, w-16 = 4rem = 64px.
                            height={40} // h-10 equivalent = 10*4 = 40px
                            className="object-cover rounded flex-shrink-0"
                            unoptimized={true} // Add this if you haven't configured remote patterns yet, or remove if configured
                          />
                        )}
                        <div className="flex-grow overflow-hidden">
                          <p
                            className="font-medium truncate"
                            title={
                              videoTask.system_metadata?.filename ||
                              videoTask.video_id
                            }
                          >
                            {videoTask.system_metadata?.filename ||
                              videoTask.video_id}
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
                        disabled={!editableQueryText.trim() || isSearching}
                        className="w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                      >
                        {isSearching ? "Searching..." : "Search Clips"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400 border border-dashed border-gray-600 rounded-md">
                    <p>
                      Chat with the AI to define what you&apos;re looking for in
                      &quot;{currentVideoName || "your video"}&quot;.
                    </p>
                    <p className="text-sm">
                      Suggested search queries will appear here once generated.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Search Results Section */}
            {(isSearching || searchError || searchResults) && videoId && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h2 className="text-2xl font-semibold mb-4">4. Found Clips</h2>
                {isSearching && (
                  <p className="text-center text-gray-300">Loading clips...</p>
                )}
                {searchError && (
                  <p className="text-red-400 text-center">
                    Error finding clips: {searchError}
                  </p>
                )}
                {searchResults && !isSearching && (
                  <>
                    {searchResults.length === 0 && (
                      <p className="text-gray-400 text-center">
                        No clips found matching your query.
                      </p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {searchResults.map((clip, index) => (
                          <div
                            key={index}
                            className="bg-gray-700/50 p-3 rounded-md flex gap-3 items-start"
                          >
                            {clip.thumbnail_url && (
                              <Image
                                src={clip.thumbnail_url}
                                alt={`Clip thumbnail ${index + 1}`}
                                width={96} // w-24 equivalent = 24*4 = 96px
                                height={56} // h-14 equivalent = 14*4 = 56px
                                className="object-cover rounded flex-shrink-0"
                                unoptimized={true} // Add this if you haven't configured remote patterns yet, or remove if configured
                              />
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-semibold">
                                Clip {index + 1}: {clip.start.toFixed(2)}s -{" "}
                                {clip.end.toFixed(2)}s
                              </p>
                              <p className="text-xs text-gray-300">
                                Score: {clip.score.toFixed(2)} | Confidence:{" "}
                                {clip.confidence}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="ml-auto h-5 w-5 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400 focus:ring-offset-gray-800"
                              checked={selectedClips.some(
                                (sc) =>
                                  sc.start === clip.start &&
                                  sc.end === clip.end &&
                                  sc.video_id === clip.video_id
                              )}
                              onChange={() => handleToggleClipSelection(clip)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <button
                        onClick={handleGenerateClips}
                        disabled={
                          isGeneratingClips || selectedClips.length === 0
                        }
                        className="mt-4 w-full px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                      >
                        {isGeneratingClips
                          ? "Generating Clips..."
                          : `Generate ${selectedClips.length} Selected Clip(s)`}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/10 p-6 rounded-lg md:sticky md:top-8">
            <h2 className="text-2xl font-semibold mb-4">2. Preview & Chat</h2>

            {/* Video Preview Section */}
            <div className="mb-6 bg-black rounded aspect-video overflow-hidden flex items-center justify-center">
              {isFetchingVideoDetails ? (
                <p className="text-gray-400">Fetching video stream...</p>
              ) : videoPreviewSrc || selectedVideoHlsUrl ? (
                <video
                  ref={videoRef}
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
      {/* Generated Clips Results Section */}
      {(isGeneratingClips || clipGenerationError || generatedClipResults) &&
        videoId && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">
              5. Generated Video Clips
            </h2>
            {isGeneratingClips && (
              <p className="text-center text-gray-300">
                Clips are being generated by FFmpeg, please wait...
              </p>
            )}
            {clipGenerationError && (
              <p className="text-red-400 text-center">
                Error during clip generation: {clipGenerationError}
              </p>
            )}
            {generatedClipResults && !isGeneratingClips && (
              <>
                {generatedClipResults.length === 0 && !clipGenerationError && (
                  <p className="text-gray-400 text-center">
                    No clips were generated or generation failed silently.
                  </p>
                )}
                {generatedClipResults.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {generatedClipResults.map((gClip, index) => (
                      <div
                        key={gClip.id || index}
                        className={`bg-gray-700/50 p-3 rounded-md ${
                          gClip.error ? "border border-red-500" : ""
                        }`}
                      >
                        <p
                          className="text-sm font-semibold truncate"
                          title={gClip.fileName}
                        >
                          {gClip.fileName}
                        </p>
                        {gClip.error ? (
                          <p className="text-xs text-red-400">
                            Error: {gClip.error}
                          </p>
                        ) : (
                          <a
                            href={gClip.downloadUrl}
                            download
                            className="mt-1 inline-block px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                          >
                            Download Clip
                          </a>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {gClip.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
    </main>
  );
}
