"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { VideoDetails, VideoSummaryData } from "@/lib/twelvelabs"; // Assuming VideoDetails is needed for HLS
import Hls from "hls.js";

interface RefinedSocialPost {
  refinedText: string;
}

export default function SocialPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [videoSummary, setVideoSummary] = useState<VideoSummaryData | null>(
    null
  );
  const [socialPost, setSocialPost] = useState<RefinedSocialPost | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const videoElement = document.getElementById(
      "social-preview-player"
    ) as HTMLVideoElement | null;
    let hls: Hls | null = null;

    const fetchVideoDataAndSummary = async () => {
      setIsLoadingSummary(true);
      setError(null);
      try {
        // 1. Fetch Video Details (for HLS URL primarily)
        const detailsRes = await fetch(`/api/video-details/${videoId}`);
        if (!detailsRes.ok) {
          const errData = await detailsRes.json();
          throw new Error(
            `Failed to fetch video details: ${
              errData.error || detailsRes.statusText
            }`
          );
        }
        const details: VideoDetails = await detailsRes.json();
        setVideoDetails(details);
        if (details.hls?.video_url) {
          setHlsUrl(details.hls.video_url);
          if (videoElement && Hls.isSupported()) {
            if (hls) {
              hls.destroy();
            }
            hls = new Hls();
            hls.loadSource(details.hls.video_url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoElement
                .play()
                .catch((playError) =>
                  console.warn(
                    "Autoplay prevented on social preview page:",
                    playError
                  )
                );
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data.fatal) {
                console.error("HLS fatal error (social preview):", data);
                // Potentially try to recover or display a message
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error(
                      "HLS.js: fatal network error encountered, trying to recover"
                    );
                    hls?.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error(
                      "HLS.js: fatal media error encountered, trying to recover"
                    );
                    hls?.recoverMediaError();
                    break;
                  default:
                    // cannot recover
                    hls?.destroy();
                    break;
                }
              }
            });
          } else if (
            videoElement &&
            details.hls?.video_url &&
            videoElement.canPlayType("application/vnd.apple.mpegurl")
          ) {
            videoElement.src = details.hls.video_url;
            videoElement.addEventListener("loadedmetadata", () => {
              videoElement
                .play()
                .catch((playError) =>
                  console.warn(
                    "Autoplay prevented (native HLS on social preview):",
                    playError
                  )
                );
            });
          }
        } else {
          console.warn("HLS URL not found in video details");
        }

        // 2. Fetch Video Summary
        const summaryRes = await fetch("/api/generate-video-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        if (!summaryRes.ok) {
          const errData = await summaryRes.json();
          throw new Error(
            `Failed to generate video summary: ${
              errData.error || summaryRes.statusText
            }`
          );
        }
        const summary: VideoSummaryData = await summaryRes.json();
        setVideoSummary(summary);

        // 3. Fetch Refined Social Post (once summary is available)
        if (summary.summary) {
          setIsLoadingPost(true);
          const postRes = await fetch("/api/refine-text-for-social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ textToRefine: summary.summary }),
          });
          if (!postRes.ok) {
            const errData = await postRes.json();
            throw new Error(
              `Failed to refine social post: ${
                errData.error || postRes.statusText
              }`
            );
          }
          const post: RefinedSocialPost = await postRes.json();
          setSocialPost(post);
          setIsLoadingPost(false);
        }
      } catch (err: any) {
        console.error("Error in social preview page:", err);
        setError(err.message);
      } finally {
        setIsLoadingSummary(false);
        // setIsLoadingPost(false); // This is handled within the summary success block
      }
    };

    fetchVideoDataAndSummary();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoId]);

  // Basic loading and error states for now
  if (isLoadingSummary)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading video data and summary...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  if (!videoDetails || !videoSummary)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Video data or summary not found.
      </div>
    );

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Post copied to clipboard!"))
      .catch((err) => alert("Failed to copy: " + err));
  };

  // We'll add a video player (like HLS.js) and proper layout in the next step.
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Social Post Preview for: {videoDetails.metadata?.filename || videoId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Video Preview</h2>
          {hlsUrl ? (
            <video
              id="social-preview-player"
              controls
              playsInline
              className="w-full aspect-video bg-black rounded"
            ></video>
          ) : (
            // We will integrate HLS.js here in a subsequent step if needed for robust playback
            <p>Video preview not available.</p>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Full Video Summary</h3>
            {isLoadingSummary ? (
              <p>Loading summary...</p>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {videoSummary.summary}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Social Post</h2>
          {isLoadingPost && <p>Generating social post...</p>}
          {socialPost && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-gray-800 whitespace-pre-wrap mb-3">
                {socialPost.refinedText}
              </p>
              <button
                onClick={() => handleCopyToClipboard(socialPost.refinedText)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy Post
              </button>
            </div>
          )}
          {!isLoadingPost && !socialPost && !error && (
            <p>No social post generated yet, or still loading.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// HLS.js integration will be added if direct video tag playback is not sufficient or for better controls.
// For now, a simple video tag is used, assuming the HLS URL works directly in modern browsers.
// If HLS.js is needed, it would be initialized in a useEffect hook similar to the upload page.
