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
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Suggested prompts for quick actions
  const suggestedPrompts = [
    "Create highlight reel",
    "Find key quotes", 
    "Break into clips",
    "Most engaging parts"
  ];

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

  const handlePromptClick = (prompt: string) => {
    setChatMessage(prompt);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    // Here you could implement actual chat functionality
    // For now, we'll just show a placeholder response
    alert(`You selected: "${chatMessage}". This would normally start clip generation.`);
    setChatMessage("");
  };

  // Function to truncate summary text
  const getTruncatedSummary = (text: string, maxLines: number = 4) => {
    const words = text.split(' ');
    const wordsPerLine = 15; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;
    
    if (words.length <= maxWords) return text;
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  if (isLoadingData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
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
      <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
          <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span> 
            <span className="font-medium">Back</span>
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
      <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
          <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span> 
            <span className="font-medium">Back</span>
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
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Enhanced Header */}
        <div className="mb-12">
          <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span> 
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-200">AI Generated Content</span>
            </div>
            
            <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Social Media
            </h1>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Preview
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your AI-crafted video clip and social media post, ready to captivate your audience
            </p>
          </div>
        </div>

        {/* Enhanced Main Content - Vertical Stack */}
        <div className="space-y-8">
          {/* Video Clip Section - Enhanced */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generated Clip</h2>
                <p className="text-purple-200">Your AI-crafted video masterpiece</p>
              </div>
            </div>
            
            {clipUrl ? (
              <div className="space-y-6">
                <div className="relative group/video">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover/video:blur-2xl transition-all duration-300"></div>
                  <video
                    id="social-preview-player"
                    src={clipUrl}
                    controls
                    playsInline
                    className="relative w-full aspect-video bg-black rounded-2xl shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                    onError={(e) => {
                      console.error("Error playing clip:", e);
                      setError("Could not play the video clip. The URL might be invalid or the format not supported.");
                    }}
                  />
                </div>
                
                <a
                  href={clipUrl}
                  download
                  className="group/download inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:scale-105"
                >
                  <span className="text-xl group-hover/download:animate-bounce">📥</span> 
                  <span>Download Clip</span>
                </a>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-6 opacity-50">📹</div>
                <p className="text-lg">Video clip URL not provided. Preview not available.</p>
              </div>
            )}
          </div>

          {/* Social Post Card - Enhanced */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-pink-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Social Media Post</h2>
                <p className="text-pink-200">Ready to share</p>
              </div>
            </div>
            
            {isLoadingPost && (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-6"></div>
                  <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse"></div>
                </div>
                <p className="text-gray-300 text-lg">Crafting your perfect post...</p>
              </div>
            )}

            {socialPost && (
              <div className="space-y-6">
                {/* Enhanced Social Post Preview */}
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">AI Generated Post</p>
                      <p className="text-purple-200 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Just now
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-white leading-relaxed text-lg whitespace-pre-wrap mb-6">
                    {socialPost.refinedText}
                  </p>
                  
                  <div className="flex items-center gap-6 text-gray-300">
                    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                      <span className="text-xl">💬</span> <span className="font-medium">0</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                      <span className="text-xl">🔄</span> <span className="font-medium">0</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                      <span className="text-xl">❤️</span> <span className="font-medium">0</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-purple-400 transition-colors ml-auto">
                      <span className="text-xl">📤</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Copy Button */}
                <button
                  onClick={() => handleCopyToClipboard(socialPost.refinedText)}
                  className={`group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    copySuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/25 hover:scale-105"
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <span className="text-xl animate-bounce">✅</span> 
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl group-hover:scale-110 transition-transform">📋</span> 
                      <span>Copy Post</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!isLoadingPost && !socialPost && !error && videoSummary && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-6 opacity-50">📱</div>
                <p className="text-lg">Social post will appear here once generated.</p>
              </div>
            )}
          </div>

          {/* Video Summary Card - Enhanced */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Video Summary</h3>
                <p className="text-blue-200">AI-generated insights</p>
              </div>
            </div>
            
            {videoSummary ? (
              <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10">
                <p className="text-gray-100 leading-relaxed text-lg whitespace-pre-wrap">
                  {isExpanded 
                    ? videoSummary.summary 
                    : getTruncatedSummary(videoSummary.summary)
                  }
                </p>
                {videoSummary.summary.split(' ').length > 60 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-xl text-blue-200 hover:text-white transition-all duration-300 font-medium"
                  >
                    {isExpanded ? '📖 Show Less' : '📚 Read More'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4 opacity-50">📄</div>
                <p>Summary not available.</p>
              </div>
            )}
          </div>

          {/* Create More Clips Card - Enhanced */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Create More Clips</h3>
                <p className="text-indigo-200">AI-powered clip generation</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Describe your perfect clip..."
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl transition-all duration-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  <span className="text-xl">🚀</span>
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-4 font-medium">✨ Quick suggestions:</p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="group px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-purple-500/20 hover:to-indigo-500/20 border border-white/20 hover:border-purple-500/30 rounded-xl text-sm text-white transition-all duration-300 hover:scale-105 font-medium"
                    >
                      <span className="group-hover:animate-pulse">✨</span> {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tips Section */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-yellow-500/30 transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Pro Tips</h3>
                <p className="text-yellow-200">Maximize your reach</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: "⏰", text: "Post during peak engagement hours for your audience" },
                { icon: "🏷️", text: "Consider adding platform-specific hashtags" },
                { icon: "💬", text: "Engage with comments to boost visibility" },
                { icon: "🌐", text: "Cross-post to multiple platforms for maximum reach" }
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/20 transition-all duration-300 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{tip.icon}</span>
                  <p className="text-gray-200 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
