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
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  };

  if (isLoadingData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(280,100%,70%)] mx-auto mb-4"></div>
              <p className="text-xl">Loading your social media preview...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span>←</span> Back
          </button>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2 text-red-300">Error</h2>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!videoSummary) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span>←</span> Back
          </button>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-xl text-gray-300">Video summary not found.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span>←</span> Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Social Media <span className="text-[hsl(280,100%,70%)]">Preview</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Your AI-generated clip and social media post
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Clip Section */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🎬 Generated Clip
              </h2>
              {clipUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      id="social-preview-player"
                      src={clipUrl}
                      controls
                      playsInline
                      className="w-full aspect-video bg-black rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error("Error playing clip:", e);
                        setError(
                          "Could not play the video clip. The URL might be invalid or the format not supported."
                        );
                      }}
                    />
                  </div>
                  <a
                    href={clipUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    <span>📥</span> Download Clip
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-4">📹</div>
                  <p>Video clip URL not provided. Preview not available.</p>
                </div>
              )}
            </div>

            {/* Video Summary Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📝 Video Summary
              </h3>
              {videoSummary ? (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {videoSummary.summary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Summary not available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Post Section */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                📱 Social Media Post
              </h2>
              
              {isLoadingPost && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(280,100%,70%)] mx-auto mb-4"></div>
                  <p className="text-gray-300">Generating your social post...</p>
                </div>
              )}

              {socialPost && (
                <div className="space-y-4">
                  {/* Social Post Preview */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[hsl(280,100%,70%)] to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">AI Generated Post</p>
                        <p className="text-sm text-gray-300">Just now</p>
                      </div>
                    </div>
                    <p className="text-white leading-relaxed whitespace-pre-wrap mb-4">
                      {socialPost.refinedText}
                    </p>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span>💬 0</span>
                      <span>🔄 0</span>
                      <span>❤️ 0</span>
                      <span>📤</span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyToClipboard(socialPost.refinedText)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                      copySuccess
                        ? "bg-green-600 text-white"
                        : "bg-[hsl(280,100%,70%)] hover:bg-[hsl(280,100%,60%)] text-white"
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <span>✅</span> Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <span>📋</span> Copy Post
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isLoadingPost && !socialPost && !error && videoSummary && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-4">📱</div>
                  <p>Social post based on the summary will appear here.</p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                💡 Tips for Social Media
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(280,100%,70%)]">•</span>
                  Post during peak engagement hours for your audience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(280,100%,70%)]">•</span>
                  Consider adding platform-specific hashtags
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(280,100%,70%)]">•</span>
                  Engage with comments to boost visibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(280,100%,70%)]">•</span>
                  Cross-post to multiple platforms for maximum reach
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
