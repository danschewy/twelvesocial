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
  const [uploadProgress, setUploadProgress] = useState(0); // For XHR based progress
  const [uploadSpeed, setUploadSpeed] = useState<number>(0); // bytes per second
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0); // seconds
  const [taskId, setTaskId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper function to format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Helper function to validate video aspect ratio
  const validateVideoAspectRatio = (file: File): Promise<{ isValid: boolean; width?: number; height?: number; aspectRatio?: number; error?: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const aspectRatio = width / height;
        
        // Twelve Labs requires aspect ratio between 1:1 (1.0) and 16:9 (1.78)
        const minAspectRatio = 1.0; // 1:1
        const maxAspectRatio = 16/9; // 16:9 ≈ 1.78
        
        URL.revokeObjectURL(url);
        
        if (aspectRatio >= minAspectRatio && aspectRatio <= maxAspectRatio) {
          resolve({ isValid: true, width, height, aspectRatio });
        } else {
          resolve({ 
            isValid: false, 
            width, 
            height, 
            aspectRatio,
            error: `Invalid aspect ratio ${aspectRatio.toFixed(2)}:1. Please upload a video with aspect ratio between 1:1 and 16:9. Current resolution is ${width}x${height}.`
          });
        }
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ 
          isValid: false, 
          error: "Could not read video metadata. Please ensure the file is a valid video."
        });
      };
      
      video.src = url;
    });
  };

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
    setUploadSpeed(0);
    setEstimatedTimeRemaining(0);
    setTaskId(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Validate aspect ratio before proceeding
    console.log('Validating video aspect ratio...');
    const validation = await validateVideoAspectRatio(file);
    
    if (!validation.isValid) {
      console.error('Video validation failed:', validation.error);
      setErrorMessage(validation.error || "Video validation failed");
      return;
    }
    
    console.log(`Video validation passed: ${validation.width}x${validation.height} (${validation.aspectRatio?.toFixed(2)}:1)`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      // Use XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      let startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);

          // Calculate upload speed and time remaining
          const currentTime = Date.now();
          const timeElapsed = (currentTime - lastTime) / 1000; // seconds
          const bytesUploaded = event.loaded - lastLoaded;
          
          if (timeElapsed > 0) {
            const currentSpeed = bytesUploaded / timeElapsed; // bytes per second
            setUploadSpeed(currentSpeed);
            
            const remainingBytes = event.total - event.loaded;
            const estimatedTime = remainingBytes / currentSpeed; // seconds
            setEstimatedTimeRemaining(Math.max(0, estimatedTime));
          }
          
          lastLoaded = event.loaded;
          lastTime = currentTime;
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', async () => {
        console.log('XHR load event triggered, status:', xhr.status);
        console.log('XHR response text:', xhr.responseText);
        
        setIsUploading(false);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.log("Upload to server successful, Twelve Labs Task ID:", result.taskId);
            
            if (!result.taskId) {
              throw new Error("No task ID received from server");
            }
            
            setTaskId(result.taskId);
            setProcessingStatus("PROCESSING");

            // Start polling for status
            pollingIntervalRef.current = setInterval(
              () => pollVideoStatus(result.taskId),
              5000
            );
            pollVideoStatus(result.taskId);
          } catch (parseError) {
            console.error("Error parsing server response:", parseError);
            console.error("Raw response:", xhr.responseText);
            setErrorMessage("Failed to parse server response");
            setUploadProgress(0);
            setUploadSpeed(0);
            setEstimatedTimeRemaining(0);
          }
        } else {
          console.error("Upload failed with status:", xhr.status);
          let errorMessage = "Upload to server failed";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.details || errorMessage;
          } catch (parseError) {
            // Use default error message if parsing fails
            console.error("Could not parse error response:", parseError);
          }
          setErrorMessage(errorMessage);
          setUploadProgress(0);
          setUploadSpeed(0);
          setEstimatedTimeRemaining(0);
        }
      });

      // Handle upload errors
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setEstimatedTimeRemaining(0);
        setErrorMessage("Network error during upload");
      });

      // Handle upload abort
      xhr.addEventListener('abort', () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setEstimatedTimeRemaining(0);
        setErrorMessage("Upload was cancelled");
      });

      // Start the upload
      xhr.open('POST', '/api/upload-video');
      xhr.send(formData);

    } catch (error) {
      console.error("Error during video upload process:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Video upload process failed"
      );
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setEstimatedTimeRemaining(0);
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
            ? `Uploading to server... ${uploadProgress}%`
            : `Processing video (Status: ${
                processingStatus || "Initializing..."
              })`}
        </p>
        {isUploading && (
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>{uploadProgress}% uploaded</span>
              <span>
                {uploadSpeed > 0 && `${formatBytes(uploadSpeed)}/s`}
                {estimatedTimeRemaining > 0 && estimatedTimeRemaining < 3600 && 
                  ` • ${formatTimeRemaining(estimatedTimeRemaining)} remaining`}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        {((!isUploading && taskId &&
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 max-w-md">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <p className="text-red-400 font-medium mb-2">Upload Error</p>
                <p className="text-red-300 text-sm mb-3">{errorMessage}</p>
                {errorMessage.includes("aspect ratio") && (
                  <div className="text-gray-300 text-xs">
                    <p className="mb-1"><strong>Supported aspect ratios:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Square (1:1) - Instagram posts</li>
                      <li>Standard (4:3) - Traditional video</li>
                      <li>Widescreen (16:9) - YouTube, most platforms</li>
                    </ul>
                    <p className="mt-2 text-gray-400">
                      💡 Tip: Use video editing software to crop or resize your video to fit these requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 max-w-md">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <p className="text-red-400 font-medium mb-2">Upload Error</p>
                <p className="text-red-300 text-sm mb-3">{errorMessage}</p>
                {errorMessage.includes("aspect ratio") && (
                  <div className="text-gray-300 text-xs">
                    <p className="mb-1"><strong>Supported aspect ratios:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Square (1:1) - Instagram posts</li>
                      <li>Standard (4:3) - Traditional video</li>
                      <li>Widescreen (16:9) - YouTube, most platforms</li>
                    </ul>
                    <p className="mt-2 text-gray-400">
                      💡 Tip: Use video editing software to crop or resize your video to fit these requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 max-w-md">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <p className="text-red-400 font-medium mb-2">Upload Error</p>
              <p className="text-red-300 text-sm mb-3">{errorMessage}</p>
              {errorMessage.includes("aspect ratio") && (
                <div className="text-gray-300 text-xs">
                  <p className="mb-1"><strong>Supported aspect ratios:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Square (1:1) - Instagram posts</li>
                    <li>Standard (4:3) - Traditional video</li>
                    <li>Widescreen (16:9) - YouTube, most platforms</li>
                  </ul>
                  <p className="mt-2 text-gray-400">
                    💡 Tip: Use video editing software to crop or resize your video to fit these requirements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
