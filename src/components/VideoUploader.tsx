"use client";

import { useState, useRef, ChangeEvent } from "react";

interface VideoUploaderProps {
  onVideoUploaded: (file: File, videoId: string) => void;
}

export default function VideoUploader({ onVideoUploaded }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // To show loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setVideoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate API call and getting a videoId
    setIsUploading(true);
    console.log("Simulating upload for:", file.name);
    setTimeout(() => {
      const mockVideoId = `mock-id-${Date.now()}`;
      onVideoUploaded(file, mockVideoId); // Call the callback
      setIsUploading(false);
      console.log("Simulated upload complete, ID:", mockVideoId);
    }, 2000); // Simulate 2 second upload
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      processFile(file);
    } else {
      console.log("Invalid file type dropped");
      // TODO: Show user-friendly error
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openFileDialog = () => {
    if (isUploading) return; // Don't open if already processing
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-64 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center mb-4 transition-colors ${
          isUploading
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-gray-300"
        }`}
        onDrop={!isUploading ? handleDrop : undefined}
        onDragOver={!isUploading ? handleDragOver : undefined}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/mov,video/quicktime,video/x-msvideo,video/x-flv,video/webm,video/mkv"
          className="hidden"
          disabled={isUploading}
        />
        {isUploading ? (
          <p className="text-gray-300">Processing video...</p>
        ) : videoPreviewUrl ? (
          <p className="text-gray-300">Video selected: {videoFile?.name}</p>
        ) : (
          <p className="text-gray-400">
            Drag & drop your video here, or click to select
          </p>
        )}
      </div>

      {videoPreviewUrl && (
        <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-4">
          <video
            src={videoPreviewUrl}
            controls
            className="w-full h-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      {isUploading && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full animate-pulse"
            style={{ width: "100%" }}
          ></div>
        </div>
      )}
    </div>
  );
}
