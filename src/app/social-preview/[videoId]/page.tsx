"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { VideoSummaryData } from "@/lib/twelvelabs";

interface RefinedSocialPost {
  refinedText: string;
}

export default function SocialPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const videoId = params.videoId as string;
  const clipUrl = searchParams.get("clipUrl");

  const [videoSummary, setVideoSummary] = useState<VideoSummaryData | null>(
    null
  );
  const [socialPost, setSocialPost] = useState<RefinedSocialPost | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    if (!clipUrl) {
      setError("Clip URL is missing. Cannot display video preview.");
      setIsLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
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
                (errData as { error?: string }).error || postRes.statusText
              }`
            );
          }
          const post: RefinedSocialPost = await postRes.json();
          setSocialPost(post);
          setIsLoadingPost(false);
        }
      } catch (err: unknown) {
        console.error("Error in social preview page:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error occurred while fetching data.");
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [videoId, clipUrl]);

  if (isLoadingData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading summary and post data...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  if (!videoSummary)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Video summary not found.
      </div>
    );

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Post copied to clipboard!"))
      .catch((err) => alert("Failed to copy: " + err));
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Social Post Preview (Video ID: {videoId})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Clip Preview</h2>
          {clipUrl ? (
            <div className="mb-2">
              <video
                id="social-preview-player"
                src={clipUrl}
                controls
                playsInline
                className="w-full aspect-video bg-black rounded"
                onError={(e) => {
                  console.error("Error playing clip:", e);
                  setError(
                    "Could not play the video clip. The URL might be invalid or the format not supported."
                  );
                }}
              ></video>
              <a
                href={clipUrl}
                download
                className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download Clip
              </a>
            </div>
          ) : (
            <p>Video clip URL not provided. Preview not available.</p>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-2">
              Full Video Summary (from original video)
            </h3>
            {isLoadingData && !videoSummary ? (
              <p>Loading summary...</p>
            ) : videoSummary ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {videoSummary.summary}
              </p>
            ) : (
              <p>Summary not available.</p>
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
          {!isLoadingPost && !socialPost && !error && videoSummary && (
            <p>Social post based on the summary will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
