import { Task, TwelveLabs } from "twelvelabs-js";
import FormData from "form-data";
import axios from "axios";
import type {
  ListTasksResponse,
  SearchClipData,
  VideoDetails,
  TwelveLabsApiErrorData, // Assuming this can be shared or defined here
  TwelveLabsErrorResponseData, // Assuming this can be shared or defined here
  TwelveLabsError, // Assuming this can be shared or defined here
  TwelveLabsErrorData, // Ensure this is imported or defined
  VideoSummaryData, // Import the new type
} from "./twelvelabs.ts"; // Will import shared types

// Constants
const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;
const TWELVE_LABS_BASE_URL = "https://api.twelvelabs.io/v1.3";

if (!TWELVE_LABS_API_KEY) {
  console.warn(
    "Twelve Labs API key not found. Please set TWELVE_LABS_API_KEY environment variable."
  );
}

const twelveLabsClient = TWELVE_LABS_API_KEY
  ? new TwelveLabs({ apiKey: TWELVE_LABS_API_KEY })
  : null;

// Error Interfaces (can be moved to shared types if preferred)
// For now, defining them here for simplicity if they are only used server-side.
// If they are used by client-side error handling for API route responses, they should be in shared types.
// Let's assume they are potentially shared for now and will be imported.

// getManualIndexId
export const getManualIndexId = async (indexId?: string): Promise<string> => {
  const targetIndexIdToUse = indexId || process.env.TWELVE_LABS_INDEX_ID;
  if (!targetIndexIdToUse) {
    throw new Error(
      "No Twelve Labs Index ID provided and TWELVE_LABS_INDEX_ID is not set in environment."
    );
  }
  console.log("Using Twelve Labs Index ID: " + targetIndexIdToUse);
  return targetIndexIdToUse;
};

// uploadVideoToIndex
export async function uploadVideoToIndex(
  indexId: string,
  videoFile: File
): Promise<string> {
  if (!TWELVE_LABS_API_KEY) {
    throw new Error("Twelve Labs API key is not configured.");
  }
  console.log(
    'Uploading video "' +
      videoFile.name +
      '" to index ' +
      indexId +
      " via REST API (axios)..."
  );
  const arrayBuffer = await videoFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const formData = new FormData();
  formData.append("index_id", indexId);
  formData.append("enable_video_stream", "true");
  formData.append("video_file", buffer, {
    filename: videoFile.name,
    contentType: videoFile.type,
  });
  const headers = {
    "x-api-key": TWELVE_LABS_API_KEY,
    ...formData.getHeaders(),
  };
  try {
    const response = await axios.post(
      TWELVE_LABS_BASE_URL + "/tasks",
      formData,
      { headers: headers, maxBodyLength: Infinity, maxContentLength: Infinity }
    );
    const responseData = response.data;
    if (!responseData._id) {
      throw new Error("Task ID not found in Twelve Labs API response.");
    }
    return responseData._id;
  } catch (error) {
    console.error(
      "Error uploading video to Twelve Labs via REST API (axios):",
      error
    );
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const responseData = error.response.data;
        const status = error.response.status;
        const errorMessage =
          typeof responseData === "string"
            ? responseData
            : (responseData as TwelveLabsErrorResponseData).message ||
              JSON.stringify(responseData);
        const apiError = new Error(
          "Twelve Labs API Error (" + status + "): " + errorMessage
        ) as TwelveLabsError;
        apiError.status = status;
        apiError.response = { data: responseData, status: status };
        throw apiError;
      } else if (error.request) {
        const requestError = new Error(
          "Twelve Labs API Error: No response received from server. " +
            error.message
        ) as TwelveLabsError;
        throw requestError;
      } else {
        const setupError = new Error(
          "Twelve Labs API Error: Error setting up request. " + error.message
        ) as TwelveLabsError;
        throw setupError;
      }
    } else {
      const genericError = new Error(
        "Failed to upload video: " + (error as Error).message
      ) as TwelveLabsError;
      throw genericError;
    }
  }
}

// getVideoProcessingStatus
export async function getVideoProcessingStatus(taskId: string): Promise<Task> {
  if (!twelveLabsClient) {
    throw new Error(
      "Twelve Labs client is not initialized. API key may be missing."
    );
  }
  try {
    const taskStatus: Task = await twelveLabsClient.task.retrieve(taskId);
    console.log("Task " + taskId + " status: " + taskStatus.status);
    return taskStatus;
  } catch (error) {
    console.error("Error retrieving status for task " + taskId + ":", error);
    const twelveLabsError = error as TwelveLabsError;
    if (twelveLabsError.response && twelveLabsError.response.data) {
      const data = twelveLabsError.response.data;
      const message =
        typeof data === "string"
          ? data
          : (data as TwelveLabsErrorResponseData).message;
      throw new Error(
        "Twelve Labs API Error retrieving status: " +
          (message || JSON.stringify(data))
      );
    }
    throw new Error("Failed to retrieve status for task " + taskId + ".");
  }
}

// listProcessedVideosInIndex
export const listProcessedVideosInIndex = async (
  indexId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = "created_at",
  sortOption: string = "desc"
): Promise<ListTasksResponse> => {
  if (!TWELVE_LABS_API_KEY) {
    throw new Error("Twelve Labs API key is not set.");
  }
  if (!indexId) {
    throw new Error("Index ID is required to list videos.");
  }
  const actualLimit = Math.min(limit, 50);
  try {
    const queryParams: Record<string, string | number | undefined> = {
      index_id: indexId,
      status: "ready",
      page: page,
      page_limit: actualLimit,
      sort_by: sortBy,
      sort_option: sortOption,
    };
    const response = await axios.get<ListTasksResponse>(
      `${TWELVE_LABS_BASE_URL}/tasks`,
      {
        headers: {
          "x-api-key": TWELVE_LABS_API_KEY,
          "Content-Type": "application/json",
        },
        params: queryParams,
      }
    );
    if (response.status === 200) return response.data;
    else {
      const errorData = response.data as unknown as TwelveLabsApiErrorData;
      throw new Error(
        `Failed to list videos: ${
          errorData?.message || response.statusText || "Unknown API error"
        } (Status: ${response.status})`
      );
    }
  } catch (error: unknown) {
    let errorMessage = "Error listing videos from Twelve Labs.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const apiError = error.response.data as TwelveLabsApiErrorData;
        errorMessage = `Twelve Labs API Error: ${
          apiError?.message || error.response.statusText || "Unknown error"
        } (Status: ${error.response.status})`;
      } else if (error.request)
        errorMessage =
          "No response received from Twelve Labs API while listing videos.";
      else
        errorMessage = `Error in setting up list videos request: ${
          (error as Error).message
        }`;
    } else {
      errorMessage = (error as Error).message;
    }
    throw new Error(errorMessage);
  }
};

// SearchAPIResponse Interface (specific to searchVideo)
interface SearchAPIResponse {
  data: SearchClipData[];
  page_info: {
    limit_per_page?: number;
    page_limit?: number;
    offset?: number;
    total_results?: number;
    page?: number;
    total_pages?: number;
    next_page_token?: string;
    page_expired_at?: string;
  };
  search_pool?: {
    index_id: string;
    total_count?: number;
    total_duration?: number;
  };
}

// searchVideo
export async function searchVideo(
  indexId: string,
  videoId: string,
  query: string,
  searchOptions: string[] = ["visual", "audio"],
  pageLimit: number = 50
): Promise<SearchClipData[]> {
  if (!TWELVE_LABS_API_KEY)
    throw new Error("Twelve Labs API key is not configured.");
  if (!indexId) throw new Error("Index ID is required for searching.");
  if (!videoId) throw new Error("Video ID is required to scope the search.");
  if (!query) throw new Error("Search query is required.");

  const formData = new FormData();
  formData.append("index_id", indexId);
  formData.append("query_text", query);
  searchOptions.forEach((option) => formData.append("search_options", option));
  formData.append("filter", JSON.stringify({ id: [videoId] }));
  formData.append("page_limit", pageLimit.toString());

  try {
    const response = await axios.post<SearchAPIResponse>(
      `${TWELVE_LABS_BASE_URL}/search`,
      formData,
      {
        headers: { "x-api-key": TWELVE_LABS_API_KEY, ...formData.getHeaders() },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    if (response.status === 200 && response.data?.data)
      return response.data.data;
    else {
      const errorDetailRaw = response.data as unknown;
      let message = response.statusText;
      if (
        typeof errorDetailRaw === "object" &&
        errorDetailRaw !== null &&
        "message" in errorDetailRaw &&
        typeof errorDetailRaw.message === "string"
      ) {
        message = (errorDetailRaw as TwelveLabsApiErrorData).message || message;
      } else if (typeof errorDetailRaw === "string") message = errorDetailRaw;
      const errorDetailString =
        typeof errorDetailRaw === "string"
          ? errorDetailRaw
          : JSON.stringify(errorDetailRaw);
      throw new Error(
        `Failed to search video. Status: ${response.status}. Details: ${message} (Raw: ${errorDetailString})`
      );
    }
  } catch (error: unknown) {
    let errorMessage = "Error searching video in Twelve Labs.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const apiError = error.response.data as TwelveLabsApiErrorData;
        errorMessage = `Twelve Labs API Search Error: ${
          apiError?.message || error.response.statusText || "Unknown error"
        } (Status: ${error.response.status})`;
      } else if (error.request)
        errorMessage =
          "No response received from Twelve Labs API while searching video.";
      else
        errorMessage = `Error in setting up video search request: ${
          (error as Error).message
        }`;
    } else {
      errorMessage = (error as Error).message;
    }
    throw new Error(errorMessage);
  }
}

// getVideoDetails
export async function getVideoDetails(
  indexId: string,
  videoId: string
): Promise<VideoDetails> {
  if (!TWELVE_LABS_API_KEY)
    throw new Error("Twelve Labs API key is not configured.");
  if (!indexId) throw new Error("Index ID is required to get video details.");
  if (!videoId) throw new Error("Video ID is required to get video details.");
  const url = `${TWELVE_LABS_BASE_URL}/indexes/${indexId}/videos/${videoId}`;
  try {
    const response = await axios.get<VideoDetails>(url, {
      headers: {
        "x-api-key": TWELVE_LABS_API_KEY,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) return response.data;
    else {
      const errorData = response.data as unknown as TwelveLabsApiErrorData;
      throw new Error(
        `Failed to get video details: ${
          errorData?.message || response.statusText || "Unknown API error"
        } (Status: ${response.status})`
      );
    }
  } catch (error: unknown) {
    let errorMessage = "Failed to retrieve video details.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const apiError = error.response.data as TwelveLabsApiErrorData;
        errorMessage = `Twelve Labs API Error getting video details: ${
          apiError?.message || error.response.statusText || "Unknown error"
        } (Status: ${error.response.status})`;
      } else if (error.request)
        errorMessage =
          "No response received from Twelve Labs API while getting video details.";
      else
        errorMessage = `Error in setting up get video details request: ${
          (error as Error).message
        }`;
    } else if (error instanceof Error) errorMessage = error.message;
    throw new Error(errorMessage);
  }
}

// Function to generate video summary using /v1.3/summarize endpoint
export async function generateVideoSummary(
  videoId: string,
  prompt?: string, // Optional prompt for summarization
  temperature?: number // Optional temperature
): Promise<VideoSummaryData> {
  if (!TWELVE_LABS_API_KEY) {
    throw new Error("Twelve Labs API key is not configured.");
  }

  if (!videoId) {
    throw new Error("Video ID is required to generate a summary.");
  }

  const requestBody: {
    video_id: string;
    type: string;
    prompt?: string;
    temperature?: number;
  } = {
    video_id: videoId,
    type: "summary",
  };

  if (prompt) {
    requestBody.prompt = prompt;
  }
  if (temperature !== undefined) {
    requestBody.temperature = temperature;
  }

  try {
    console.log(
      `Requesting video summary from Twelve Labs: ${TWELVE_LABS_BASE_URL}/summarize`,
      requestBody
    );

    const response = await axios.post(
      `${TWELVE_LABS_BASE_URL}/summarize`,
      requestBody,
      {
        headers: {
          "x-api-key": TWELVE_LABS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // As per docs, response is { id: string, summary: string, usage: {...} }
    if (
      response.data &&
      typeof response.data.summary === "string" &&
      typeof response.data.id === "string"
    ) {
      return {
        id: response.data.id,
        summary: response.data.summary,
        // usage: response.data.usage // if you want to return usage
      };
    } else {
      console.error(
        "Unexpected response structure from /summarize:",
        response.data
      );
      throw new Error(
        "Unexpected response structure from Twelve Labs summarize API."
      );
    }
  } catch (error: unknown) {
    console.error("Error calling Twelve Labs /summarize API:", error);
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as TwelveLabsErrorData;
      let detailString: string | undefined = undefined;
      if (errorData?.detail) {
        if (typeof errorData.detail === "string") {
          detailString = errorData.detail;
        } else if (
          typeof errorData.detail === "object" &&
          errorData.detail !== null
        ) {
          detailString = JSON.stringify(errorData.detail);
        } else {
          detailString = String(errorData.detail);
        }
      }
      const errorMessage = errorData?.message || detailString;
      console.error("Twelve Labs API Error Details (Summarize):", errorData);
      throw new Error(
        `Twelve Labs API error (${
          error.response.status
        }) during summarization: ${errorMessage || "Unknown error"}`
      );
    }
    // Fallback for non-Axios errors or errors without a response property
    if (error instanceof Error) {
      throw new Error(`Failed to generate video summary: ${error.message}`);
    }
    // Generic fallback
    throw new Error(
      "Failed to generate video summary due to an unknown error."
    );
  }
  // This part should ideally not be reached because the function always throws or returns in the try block.
  // Adding a fallback throw to satisfy linters that might complain about no return path,
  // though in practice, one of the above throws will occur.
  throw new Error(
    "Unexpected state in generateVideoSummary: function did not return or throw as expected."
  );
}
