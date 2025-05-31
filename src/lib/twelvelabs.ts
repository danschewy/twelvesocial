import { Task } from "twelvelabs-js"; // For VideoProcessingStatus, if still needed client-side for type

// --- Re-exported or Shared Interfaces ---

// From original twelvelabs.ts, potentially used by client or server
export interface TwelveLabsErrorResponseData {
  message?: string;
  // Add other potential fields from Twelve Labs error responses
}

export interface TwelveLabsError extends Error {
  response?: {
    data?: TwelveLabsErrorResponseData | string;
    status?: number;
  };
  status?: number;
  isAxiosError?: boolean;
}

export interface TwelveLabsApiErrorData {
  message?: string;
  [key: string]: unknown;
}

// HLSData Interface (shared for VideoTask and VideoDetails)
export interface HLSData {
  video_url?: string;
  thumbnail_urls?: string[];
  status?: string;
  updated_at?: string;
}

// VideoTask Interface (used by client to display video lists and in VideoDetails)
export interface VideoTask {
  _id: string;
  index_id: string; // Kept for consistency if API returns it, though may not be directly used by client display
  video_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  estimated_time?: string;
  hls?: HLSData;
  metadata?: {
    filename?: string;
    duration?: number;
    width?: number;
    height?: number;
  };
  system_metadata?: {
    filename?: string;
    duration?: number;
    width?: number;
    height?: number;
  };
}

// ListTasksResponse Interface (primarily for server, but type might be useful if an API route returns it directly)
export interface ListTasksResponse {
  data: VideoTask[];
  page_info: {
    limit: number;
    offset?: number;
    total_results: number;
    page?: number;
    total_pages?: number;
  };
}

// SearchClipData Interface (used by client to display search results)
export interface SearchClipData {
  score: number;
  start: number; // in seconds
  end: number; // in seconds
  video_id: string;
  confidence: "high" | "medium" | "low" | string;
  thumbnail_url?: string;
}

// VideoDetails Interface (used by client if fetching details, potentially via an API route)
export interface VideoDetails
  extends Omit<VideoTask, "index_id" | "estimated_time"> {
  indexed_at?: string;
  system_metadata?: {
    duration: number;
    filename: string;
    fps: number;
    height: number;
    width: number;
    size_bytes?: number;
  };
  user_metadata?: Record<string, unknown>;
}

// Type for the Task object from the SDK, if needed for getVideoProcessingStatus responses through an API route
// This ensures the client knows the shape of the Task object if it needs to consume it.
export type TwelveLabsSDKTask = Task;

export interface TwelveLabsErrorData {
  message?: string; // Common field for error messages
  detail?: string | object; // More detailed error information
  // Add other common error fields if known, e.g., code, type
}

// Type for the video summary data from /v1.3/summarize endpoint
export interface VideoSummaryData {
  id: string; // The ID of the summarization job
  summary: string; // The generated summary text
  // usage?: { output_tokens: number }; // Optional: if you want to include usage stats
}
