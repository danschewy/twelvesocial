"use client";

import VideoUploader from "@/components/VideoUploader";
import ChatInterface from "@/components/ChatInterface";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  VideoTask,
  SearchClipData,
} from "@/lib/twelvelabs";
import Image from "next/image"; // Import Next.js Image component
import Hls from "hls.js"; // Import Hls.js
import Link from "next/link"; // Import Link component
import type { VideoAnalysis } from "@/lib/twelvelabs";

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
  const [clipGenerationProgress, setClipGenerationProgress] = useState<{
    current: number;
    total: number;
    currentClipName?: string;
  }>({ current: 0, total: 0 });
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

  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null);

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
          // Extract only relevant error properties to avoid circular references
          // Add comprehensive null checks to prevent runtime errors
          const errorInfo = {
            type: data?.type || 'unknown',
            details: data?.details || 'no details',
            fatal: data?.fatal || false,
            reason: data?.reason || 'unknown reason',
            level: data?.level || 'unknown level',
            url: data?.url || 'no url',
            response: data?.response ? {
              code: data.response?.code || 'no code',
              text: data.response?.text || 'no text'
            } : undefined
          };
          console.error("HLS.js error:", errorInfo);
          
          if (data?.fatal) {
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
      }
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedVideoHlsUrl]);

  const resetSearchState = () => {
    setSearchResults(null);
    setSearchError(null);
    setIsSearching(false);
  };

  const resetAllClipStates = () => {
    setSearchResults(null);
    setSelectedClips([]);
    setIsGeneratingClips(false);
    setClipGenerationProgress({ current: 0, total: 0 });
    setClipGenerationError(null);
    setGeneratedClipResults(null);
  };

  const analyzeVideo = async (videoId: string) => {
    try {
      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to analyze video"
        );
      }

      const analysis: VideoAnalysis = await response.json();
      setVideoAnalysis(analysis);
      return analysis;
    } catch (error: unknown) {
      console.error("Error analyzing video:", error);
      return null;
    }
  };

  const handleVideoUploaded = async (file: File, twelveLabsVideoId: string) => {
    setUploadedVideoFile(file);
    setVideoId(twelveLabsVideoId);
    setSelectedExistingVideo(null);
    resetSearchState();
    resetAllClipStates();
    setAiSearchPrompts(null);
    setEditableQueryText("");
    await analyzeVideo(twelveLabsVideoId);
  };

  const handleExistingVideoSelected = async (videoTask: VideoTask) => {
    console.log('UploadPage: Selecting existing video:', videoTask.video_id);
    setSelectedExistingVideo(videoTask);
    setUploadedVideoFile(null);
    setVideoId(videoTask.video_id);
    console.log('UploadPage: Set videoId to:', videoTask.video_id);
    resetSearchState();
    resetAllClipStates();
    setAiSearchPrompts(null);
    setEditableQueryText("");

    // Fetch video details for HLS URL
    if (videoTask.video_id) {
      setIsFetchingVideoDetails(true);
      try {
        const response = await fetch(
          `/api/video-details/${videoTask.video_id}`
        );
        if (response.ok) {
          const details = await response.json();
          if (details.hls?.video_url) {
            setSelectedVideoHlsUrl(details.hls.video_url);
          }
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
      } finally {
        setIsFetchingVideoDetails(false);
      }
      await analyzeVideo(videoTask.video_id);
    }
  };

  const handleSearchPromptGenerated = (data: SearchPromptData) => {
    setAiSearchPrompts(data);
    // Pre-populate the editable query text with the first query
    if (data.searchQueries && data.searchQueries.length > 0) {
      setEditableQueryText(data.searchQueries[0].queryText);
    }
  };

  const handleSearchClips = async () => {
    if (!videoId || !editableQueryText.trim()) {
      setSearchError("Video ID and search query are required.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const searchOptions =
        aiSearchPrompts?.searchQueries?.[0]?.searchOptions || ["visual"];

      const response = await fetch("/api/search-clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          query: editableQueryText.trim(),
          searchOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to search for clips"
        );
      }

      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error: unknown) {
      console.error("Error searching clips:", error);
      if (error instanceof Error) {
        setSearchError(error.message);
      } else {
        setSearchError("An unknown error occurred while searching clips.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleClipSelection = (clip: SearchClipData) => {
    setSelectedClips((prev) => {
      const isSelected = prev.some(
        (sc) =>
          sc.start === clip.start &&
          sc.end === clip.end &&
          sc.video_id === clip.video_id
      );

      if (isSelected) {
        // Remove the clip
        return prev.filter(
          (sc) =>
            !(
              sc.start === clip.start &&
              sc.end === clip.end &&
              sc.video_id === clip.video_id
            )
        );
      } else {
        // Add the clip
        return [...prev, clip];
      }
    });
  };

  const handleGenerateClips = async () => {
    if (selectedClips.length === 0) {
      setClipGenerationError("Please select at least one clip to generate.");
      return;
    }

    if (!videoId) {
      setClipGenerationError("No video selected for clip generation.");
      return;
    }

    setIsGeneratingClips(true);
    setClipGenerationError(null);
    setGeneratedClipResults(null);
    setClipGenerationProgress({ current: 0, total: selectedClips.length });

    try {
      const allResults: GeneratedClipInfo[] = [];

      // Process clips one by one to show progress
      for (let i = 0; i < selectedClips.length; i++) {
        const clip = selectedClips[i];
        const clipName = `Clip ${i + 1} (${clip.start.toFixed(1)}s - ${clip.end.toFixed(1)}s)`;
        
        setClipGenerationProgress({
          current: i,
          total: selectedClips.length,
          currentClipName: clipName
        });

        try {
          // Transform single clip to the format expected by the API
          const segments = [{
            id: `clip-${i + 1}`,
            start: clip.start,
            end: clip.end,
          }];

          console.log(`Generating clip ${i + 1}/${selectedClips.length}:`, { videoId, segments });

          const response = await fetch("/api/generate-clip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoId: videoId,
              segments: segments,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.details ||
                errorData.message ||
                `Failed to generate ${clipName}`
            );
          }

          const result = await response.json();
          if (result.data && result.data.length > 0) {
            allResults.push(...result.data);
          }

          // Update progress to show completion of current clip
          setClipGenerationProgress({
            current: i + 1,
            total: selectedClips.length,
            currentClipName: `${clipName} - Complete!`
          });

          // Small delay to show the completion message
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (clipError) {
          console.error(`Error generating clip ${i + 1}:`, clipError);
          // Add error result for this clip
          allResults.push({
            id: `clip-${i + 1}`,
            fileName: `clip_${i + 1}_error.mp4`,
            downloadUrl: "",
            message: `Failed to generate ${clipName}`,
            error: clipError instanceof Error ? clipError.message : "Unknown error"
          });
        }
      }

      setGeneratedClipResults(allResults);
      
      // Check if any clips failed
      const failedClips = allResults.filter(clip => clip.error);
      if (failedClips.length > 0) {
        setClipGenerationError(
          `${failedClips.length} out of ${allResults.length} clips could not be generated. Check details below.`
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
      setClipGenerationProgress({ current: 0, total: 0 });
    }
  };

  const currentVideoName =
    selectedExistingVideo?.system_metadata?.filename || uploadedVideoFile?.name;
  const videoPreviewSrc = localPreviewUrl || selectedVideoHlsUrl;

  // Debug logging for ChatInterface props
  console.log('UploadPage: About to render with props:', { videoId, sessionId, videoAnalysis });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-200">AI Video Processing</span>
            </div>
            
            <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Twelve Social
            </h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Upload & Create Clips
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Upload your video and let our AI identify the perfect moments for social media clips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Left Column - Upload Only */}
          <div className="xl:col-span-2 space-y-8">
            {/* Upload Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Select or Upload Video</h2>
                  <p className="text-purple-200">Choose from existing videos or upload a new one</p>
                </div>
              </div>
              
              <VideoUploader
                onVideoUploaded={handleVideoUploaded}
                videoPresent={!!(uploadedVideoFile || selectedExistingVideo)}
              />

              {isLoadingVideos && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-300">Loading your indexed videos...</p>
                </div>
              )}
              
              {errorLoadingVideos && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-300">Error loading videos: {errorLoadingVideos}</p>
                </div>
              )}

              {indexedVideos && indexedVideos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Or choose an existing video:</h3>
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {indexedVideos
                      .filter((v) => v.status === "ready" && v.video_id)
                      .map((videoTask) => (
                        <button
                          key={videoTask._id}
                          onClick={() => handleExistingVideoSelected(videoTask)}
                          className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                            selectedExistingVideo?.video_id === videoTask.video_id
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                          }`}
                        >
                          {videoTask.hls?.thumbnail_urls?.[0] && (
                            <Image
                              src={videoTask.hls.thumbnail_urls[0]}
                              alt="Thumbnail"
                              width={64}
                              height={40}
                              className="object-cover rounded-xl flex-shrink-0"
                              unoptimized={true}
                            />
                          )}
                          <div className="flex-grow overflow-hidden">
                            <p
                              className="font-medium truncate text-white"
                              title={
                                videoTask.system_metadata?.filename ||
                                videoTask.video_id
                              }
                            >
                              {videoTask.system_metadata?.filename ||
                                videoTask.video_id}
                            </p>
                            <p className="text-xs text-gray-400">
                              Uploaded: {new Date(videoTask.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
              
              {indexedVideos && indexedVideos.length === 0 && !isLoadingVideos && (
                <div className="mt-6 text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4 opacity-50">📹</div>
                  <p>No ready videos found in your index. Upload one to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Video Preview, Chat, Search & Clips */}
          <div className="space-y-8">
            {/* Video Preview Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-orange-500/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📺</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Preview & Chat</h2>
                  <p className="text-orange-200">Watch your video and chat with AI</p>
                </div>
              </div>

              {/* Video Player */}
              <div className="mb-6 bg-black rounded-2xl aspect-video overflow-hidden flex items-center justify-center border border-white/10">
                {isFetchingVideoDetails ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-gray-400">Fetching video stream...</p>
                  </div>
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
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-50">📹</div>
                      <p className="text-gray-400">Video preview will appear here.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedVideoHlsUrl && (
                <p className="text-xs text-gray-400 mb-4 text-center bg-white/5 p-3 rounded-xl">
                  Note: HLS video streaming might require specific browser support (e.g., Safari) or a dedicated HLS player for other browsers.
                </p>
              )}

              {/* Chat Interface */}
              {sessionId ? (
                <ChatInterface
                  videoId={videoId}
                  sessionId={sessionId}
                  videoAnalysis={videoAnalysis}
                  onSearchPromptGenerated={handleSearchPromptGenerated}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-gray-300">Loading chat...</p>
                </div>
              )}
            </div>

            {/* Search & Clips Section - Moved here */}
            {videoId && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-green-500/30 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Refine & Search Clips</h2>
                    <p className="text-green-200">Define what you&apos;re looking for in your video</p>
                  </div>
                </div>
                
                {aiSearchPrompts && aiSearchPrompts.searchQueries && aiSearchPrompts.searchQueries.length > 0 ? (
                  <div className="space-y-6">
                    {aiSearchPrompts.notesForUser && (
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
                        <p className="text-blue-200">
                          <span className="font-semibold">AI Assistant:</span> {aiSearchPrompts.notesForUser}
                        </p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="searchQueryText" className="block text-sm font-medium text-gray-300 mb-2">
                          Edit Search Query (for{" "}
                          <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
                            {aiSearchPrompts.searchQueries[0].searchOptions.join(", ")}
                          </span>
                          ):
                        </label>
                        <textarea
                          id="searchQueryText"
                          rows={3}
                          value={editableQueryText}
                          onChange={(e) => setEditableQueryText(e.target.value)}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-xl transition-all duration-300"
                          placeholder="Enter your search query for Twelve Labs"
                        />
                      </div>
                      <button
                        onClick={handleSearchClips}
                        disabled={!editableQueryText.trim() || isSearching}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-green-500/25"
                      >
                        {isSearching ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Searching...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-xl">🔍</span>
                            <span>Search Clips</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl">
                    <div className="text-6xl mb-4 opacity-50">💬</div>
                    <p className="text-gray-300 text-lg mb-2">
                      Chat with the AI to define what you&apos;re looking for in
                      &quot;{currentVideoName || "your video"}&quot;.
                    </p>
                    <p className="text-sm text-gray-400">
                      Suggested search queries will appear here once generated.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Search Results Section - Moved here */}
            {(isSearching || searchError || searchResults) && videoId && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Found Clips</h2>
                    <p className="text-blue-200">Select clips to generate</p>
                  </div>
                </div>
                
                {isSearching && (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Loading clips...</p>
                  </div>
                )}
                
                {searchError && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-50">⚠️</div>
                    <p className="text-red-300 text-lg">Error finding clips: {searchError}</p>
                  </div>
                )}
                
                {searchResults && !isSearching && (
                  <>
                    {searchResults.length === 0 && (
                      <div className="text-center py-16 text-gray-400">
                        <div className="text-6xl mb-4 opacity-50">🔍</div>
                        <p className="text-lg">No clips found matching your query.</p>
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {searchResults.map((clip, index) => (
                          <div
                            key={index}
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 items-start hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                          >
                            {clip.thumbnail_url && (
                              <Image
                                src={clip.thumbnail_url}
                                alt={`Clip thumbnail ${index + 1}`}
                                width={96}
                                height={56}
                                className="object-cover rounded-xl flex-shrink-0"
                                unoptimized={true}
                              />
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-semibold text-white mb-1">
                                Clip {index + 1}: {clip.start.toFixed(2)}s - {clip.end.toFixed(2)}s
                              </p>
                              <p className="text-xs text-gray-300">
                                Score: {clip.score.toFixed(2)} | Confidence: {clip.confidence}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="ml-auto h-5 w-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400 focus:ring-offset-gray-800"
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
                        disabled={isGeneratingClips || selectedClips.length === 0}
                        className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                      >
                        {isGeneratingClips ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Generating Clips...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-xl">✨</span>
                            <span>Generate {selectedClips.length} Selected Clip(s)</span>
                          </div>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Generated Clips Results Section */}
        {(isGeneratingClips || clipGenerationError || generatedClipResults) && videoId && (
          <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-green-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generated Video Clips</h2>
                <p className="text-green-200">Your AI-generated clips are ready</p>
              </div>
            </div>
            
            {isGeneratingClips && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-6"></div>
                
                {clipGenerationProgress.total > 0 && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>
                        Clip {clipGenerationProgress.current + 1} of {clipGenerationProgress.total}
                      </span>
                      <span>
                        {Math.round(((clipGenerationProgress.current) / clipGenerationProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(clipGenerationProgress.current / clipGenerationProgress.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                    {clipGenerationProgress.currentClipName && (
                      <p className="text-sm text-gray-300 mt-3">
                        {clipGenerationProgress.current < clipGenerationProgress.total 
                          ? `Processing: ${clipGenerationProgress.currentClipName}`
                          : clipGenerationProgress.currentClipName
                        }
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-gray-300 text-lg">
                  {clipGenerationProgress.total > 0 
                    ? "Generating clips with FFmpeg..." 
                    : "Clips are being generated by FFmpeg, please wait..."
                  }
                </p>
              </div>
            )}
            
            {clipGenerationError && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-50">⚠️</div>
                <p className="text-red-300 text-lg">Error during clip generation: {clipGenerationError}</p>
              </div>
            )}
            
            {generatedClipResults && !isGeneratingClips && (
              <>
                {generatedClipResults.length === 0 && !clipGenerationError && (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-6xl mb-4 opacity-50">🎬</div>
                    <p className="text-lg">No clips were generated or generation failed silently.</p>
                  </div>
                )}
                {generatedClipResults.length > 0 && (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {generatedClipResults.map((gClip, index) => (
                      <div
                        key={gClip.id || index}
                        className={`bg-white/5 border p-4 rounded-2xl transition-all duration-300 ${
                          gClip.error 
                            ? "border-red-500/30 bg-red-500/5" 
                            : "border-white/10 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <p className="text-sm font-semibold text-white mb-1">
                              {gClip.fileName}
                            </p>
                            <p className="text-xs text-gray-300 mb-2">
                              {gClip.message}
                            </p>
                            {gClip.error && (
                              <p className="text-xs text-red-400">
                                Error: {gClip.error}
                              </p>
                            )}
                          </div>
                          {!gClip.error && (
                            <div className="flex gap-3 ml-4">
                              <a
                                href={gClip.downloadUrl}
                                download
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm rounded-xl transition-all duration-300 font-medium hover:scale-105"
                              >
                                📥 Download
                              </a>
                              <Link
                                href={`/social-preview/${videoId}?clipUrl=${encodeURIComponent(gClip.downloadUrl)}`}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-sm rounded-xl transition-all duration-300 font-medium hover:scale-105"
                              >
                                👁️ Preview
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS for slow spin animation */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </main>
  );
}