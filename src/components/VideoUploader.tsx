"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";

interface VideoUploaderProps {
  // Callback with the actual videoId from Twelve Labs once processing is complete
  onVideoUploaded: (file: File, twelveLabsVideoId: string) => void;
}

export default function VideoUploader({ onVideoUploaded }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // For XHR based progress
  const [taskId, setTaskId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollVideoStatus = async (currentTaskId: string) => {
    if (!currentTaskId) return;
    try {
      // We'll create this API route next
      const response = await fetch(`/api/video-status/${currentTaskId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch video status");
      }
      const data = await response.json();
      setProcessingStatus(data.status);

      if (data.status === "READY") {
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current);
        console.log("Video processed by Twelve Labs:", data);
        // Assuming data contains the actual video_id from Twelve Labs, e.g., data.videoId or data.metadata.videoId
        // The actual field name depends on the Twelve Labs API response structure for a processed video.
        // Let's assume it's `data.videoId` for now.
        const twelveLabsVideoId = data.videoId;
        if (twelveLabsVideoId && videoFile) {
          onVideoUploaded(videoFile, twelveLabsVideoId);
        } else {
          console.error(
            "Twelve Labs video ID not found in status response or videoFile is null"
          );
          setErrorMessage(
            "Failed to finalize video processing. Video ID missing."
          );
        }
        setTaskId(null); // Clear task ID after completion
      } else if (data.status === "FAILED" || data.status === "ERROR") {
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current);
        setErrorMessage(`Video processing failed: ${data.status}`);
        setTaskId(null);
      }
    } catch (error) {
      console.error("Error polling video status:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error checking video status."
      );
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      // Don't clear task ID here, user might want to see it or retry if applicable
    }
  };

  const processFile = async (file: File) => {
    setVideoFile(file);
    setErrorMessage(null);
    setProcessingStatus(null);
    setUploadProgress(0);
    setTaskId(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
        // Note: For FormData with fetch, Content-Type is set automatically by the browser.
        // We can use XHR if we need fine-grained progress for the upload itself.
      });
      setIsUploading(false); // Upload to our server is done, now processing by TwelveLabs starts

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Upload to server failed");
      }

      const result = await response.json();
      console.log(
        "Upload to server successful, Twelve Labs Task ID:",
        result.taskId
      );
      setTaskId(result.taskId);
      setProcessingStatus("PROCESSING"); // Initial status after successful task creation

      // Start polling for status
      pollingIntervalRef.current = setInterval(
        () => pollVideoStatus(result.taskId),
        5000
      ); // Poll every 5 seconds
      pollVideoStatus(result.taskId); // Immediate first check
    } catch (error) {
      console.error("Error during video upload process:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Video upload process failed"
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
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
      setErrorMessage("Invalid file type. Please upload a video.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openFileDialog = () => {
    if (isUploading || taskId) return; // Don't open if already processing/uploading
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={`w-full h-64 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center mb-4 transition-colors ${
          isUploading || taskId
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-gray-300"
        }`}
        onDrop={!(isUploading || taskId) ? handleDrop : undefined}
        onDragOver={!(isUploading || taskId) ? handleDragOver : undefined}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/mov,video/quicktime,video/x-msvideo,video/x-flv,video/webm,video/mkv"
          className="hidden"
          disabled={isUploading || !!taskId}
        />
        {isUploading ? (
          <p className="text-gray-300">Uploading to server...</p>
        ) : taskId ? (
          <p className="text-gray-300">
            Processing video... (Status: {processingStatus || "Checking..."})
          </p>
        ) : videoPreviewUrl ? (
          <p className="text-gray-300">Video selected: {videoFile?.name}</p>
        ) : (
          <p className="text-gray-400">
            Drag & drop your video here, or click to select
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="text-red-400 mb-2 text-sm">Error: {errorMessage}</p>
      )}

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
      {(isUploading ||
        (taskId &&
          processingStatus !== "READY" &&
          processingStatus !== "FAILED" &&
          processingStatus !== "ERROR")) && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full animate-pulse"
            style={{ width: "100%" }}
          ></div>
        </div>
      )}
      {taskId && (
        <p className="text-xs text-gray-400 mb-2">Task ID: {taskId}</p>
      )}
    </div>
  );
}
