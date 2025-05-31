"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";

interface VideoUploaderProps {
  // Callback with the actual videoId from Twelve Labs once processing is complete
  onVideoUploaded: (file: File, twelveLabsVideoId: string) => void;
  videoPresent: boolean; // Added videoPresent prop
}

export default function VideoUploader({
  onVideoUploaded,
  videoPresent,
}: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadProgress] = useState(0); // For XHR based progress
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

  // ----- RENDER LOGIC -----

  // Hidden file input common to all states
  const hiddenFileInput = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept="video/mp4,video/mov,video/quicktime,video/x-msvideo,video/x-flv,video/webm,video/mkv"
      className="hidden"
      disabled={isUploading || !!taskId}
    />
  );

  // If a video processing task is active for THIS uploader instance
  // AND it's not yet in a final state (READY, FAILED, ERROR)
  const isActiveTaskNotFinal =
    taskId && !["READY", "FAILED", "ERROR"].includes(processingStatus || "");

  if (isUploading || isActiveTaskNotFinal) {
    return (
      <div className="flex flex-col items-center w-full">
        {hiddenFileInput}
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
        <p className="text-gray-300 mb-2">
          {isUploading
            ? "Uploading to server..."
            : `Processing video (Status: ${
                processingStatus || "Initializing..."
              })`}
        </p>
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
        {errorMessage && (
          <p className="text-red-400 mb-2 text-sm">Error: {errorMessage}</p>
        )}
      </div>
    );
  }

  // If NO active task in THIS uploader (or it's in a final state like READY),
  // and a video IS present globally (meaning previously uploaded and processed successfully):
  if (videoPresent) {
    return (
      <div className="flex flex-col items-center w-full">
        {hiddenFileInput}
        <button
          onClick={openFileDialog}
          className="mb-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Replace Video
        </button>
        {/* No preview of the *old* video here; UploadPage should handle that if needed. */}
        {/* Show error message if an attempt to upload new video via button fails early */}
        {errorMessage && (
          <p className="text-red-400 mb-2 text-sm">Error: {errorMessage}</p>
        )}
      </div>
    );
  }

  // Initial state: NO active task in THIS uploader, and NO video present globally:
  return (
    <div className="flex flex-col items-center w-full">
      {hiddenFileInput}
      <div
        className="w-full h-64 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-gray-300 transition-colors"
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="text-gray-400">
          Drag & drop your video here, or click to select
        </p>
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
      {errorMessage && (
        <p className="text-red-400 mb-2 text-sm">Error: {errorMessage}</p>
      )}
    </div>
  );
}
