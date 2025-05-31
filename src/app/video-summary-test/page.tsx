"use client";

import { useState } from "react";
import type { VideoSummaryData } from "@/lib/twelvelabs"; // Assuming type is exported

export default function VideoSummaryTestPage() {
  const [videoId, setVideoId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [temperature, setTemperature] = useState<number | undefined>(0.2);
  const [summaryResult, setSummaryResult] = useState<VideoSummaryData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);

    try {
      const requestBody: any = { videoId };
      if (prompt.trim()) {
        requestBody.prompt = prompt.trim();
      }
      if (temperature !== undefined) {
        requestBody.temperature = temperature;
      }

      const response = await fetch("/api/generate-video-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate summary. Details: " +
              JSON.stringify(data.details)
        );
      }
      setSummaryResult(data as VideoSummaryData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Test Video Summarization
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="videoId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Video ID (Required):
            </label>
            <input
              type="text"
              id="videoId"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prompt (Optional):
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E.g., Generate a summary for a social media post, up to two sentences."
            />
          </div>

          <div>
            <label
              htmlFor="temperature"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Temperature (Optional, 0-1, Default: 0.2):
            </label>
            <input
              type="number"
              id="temperature"
              value={temperature === undefined ? "" : temperature}
              onChange={(e) =>
                setTemperature(
                  e.target.value === "" ? undefined : parseFloat(e.target.value)
                )
              }
              step="0.1"
              min="0"
              max="1"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !videoId.trim()}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors text-lg"
          >
            {isLoading ? "Generating Summary..." : "Generate Summary"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-300 rounded-md">
            <p className="font-semibold">Error:</p>
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {summaryResult && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-800 mb-3">
              Summary Result:
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Job ID: {summaryResult.id}
            </p>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-gray-700 whitespace-pre-wrap">
                {summaryResult.summary}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
