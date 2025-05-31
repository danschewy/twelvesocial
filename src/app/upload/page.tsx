"use client";

import VideoUploader from "@/components/VideoUploader";
import ChatInterface from "@/components/ChatInterface";
import type { Metadata } from "next";
import { useState, useEffect } from "react";

export default function UploadPage() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);

  // Placeholder: Simulate getting a videoId after a video is "uploaded"
  // In reality, this would be set after a successful call to /api/upload-video
  const handleVideoUploaded = (file: File, id: string) => {
    setUploadedVideoFile(file);
    setVideoId(id);
    console.log("Video processed, ID:", id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Upload Your Video & Define Your Clips
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">1. Upload Video</h2>
            <VideoUploader onVideoUploaded={handleVideoUploaded} />
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              2. Chat with AI Assistant
            </h2>
            <ChatInterface videoId={videoId} />
          </div>
        </div>
      </div>
    </main>
  );
}
