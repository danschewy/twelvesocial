import { Task, TwelveLabs } from "twelvelabs-js"; // Keep Task for getVideoProcessingStatus
// Remove CreateTaskParams if no longer used by SDK methods we keep
// import { CreateTaskParams } from "twelvelabs-js";
import { Readable } from "stream";
import FormData from "form-data"; // For direct API call
import axios from "axios"; // Import axios

const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;
const TWELVE_LABS_BASE_URL = "https://api.twelvelabs.io/v1.3";

if (!TWELVE_LABS_API_KEY) {
  console.warn(
    "Twelve Labs API key not found. Please set TWELVE_LABS_API_KEY environment variable."
  );
}

// Initialize the SDK client only if other SDK functionalities are still needed
// For instance, if getVideoProcessingStatus still uses it.
// If all twelvelabs interactions become direct API calls, this can be removed.
const twelveLabsClient = TWELVE_LABS_API_KEY
  ? new TwelveLabs({ apiKey: TWELVE_LABS_API_KEY })
  : null;

// Define TwelveLabsError and TwelveLabsErrorResponseData if still used by error handling
// in other functions like getVideoProcessingStatus
interface TwelveLabsErrorResponseData {
  message?: string;
  // Add other potential fields from Twelve Labs error responses
}

interface TwelveLabsError extends Error {
  response?: {
    data?: TwelveLabsErrorResponseData | string; // data can be an object or sometimes a string
    status?: number; // Added for better error handling from fetch
  };
  status?: number; // For fetch errors
  isAxiosError?: boolean; // For differentiating axios errors
}

/**
 * Retrieves the target Twelve Labs index ID.
 * Prefers a specific ID if provided, otherwise defaults to the environment variable `TWELVE_LABS_INDEX_ID`.
 * @param indexId Optional. A specific index ID to use.
 * @returns The resolved index ID.
 * @throws Error if no index ID can be determined.
 */
export const getManualIndexId = async (indexId?: string): Promise<string> => {
  const targetIndexIdToUse = indexId || process.env.TWELVE_LABS_INDEX_ID; // Use process.env here
  if (!targetIndexIdToUse) {
    throw new Error(
      "No Twelve Labs Index ID provided and TWELVE_LABS_INDEX_ID is not set in environment."
    );
  }
  console.log("Using Twelve Labs Index ID: " + targetIndexIdToUse);
  return targetIndexIdToUse;
};

/**
 * Uploads a video file to a Twelve Labs index using the REST API.
 * @param {string} indexId The ID of the index to upload to.
 * @param {File} videoFile The video file to upload.
 * @returns {Promise<string>} The ID of the video processing task.
 */
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
  formData.append("video_file", buffer, {
    filename: videoFile.name,
    contentType: videoFile.type,
  });
  // Add language if the API supports it and it's needed.
  // formData.append("language", "en");

  const headers = {
    "x-api-key": TWELVE_LABS_API_KEY,
    ...formData.getHeaders(), // axios works well with headers from form-data
  };

  try {
    const response = await axios.post(
      TWELVE_LABS_BASE_URL + "/tasks",
      formData, // Pass FormData object directly
      { headers: headers, maxBodyLength: Infinity, maxContentLength: Infinity } // Added max limits just in case
    );

    const responseData = response.data;

    // Axios successful responses usually have status in 2xx range
    // No need to check response.ok like in fetch

    console.log(
      "Video upload initiated via REST API (axios). Response:",
      responseData
    );
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
      // When axios.isAxiosError is true, error has AxiosError type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = error.response.data;
        const status = error.response.status;
        const errorMessage =
          typeof responseData === "string"
            ? responseData
            : (responseData as TwelveLabsErrorResponseData).message ||
              JSON.stringify(responseData);
        // Construct a new error with a clear message
        const apiError = new Error(
          "Twelve Labs API Error (" + status + "): " + errorMessage
        ) as TwelveLabsError; // Cast to our custom error type if needed for consistency
        apiError.status = status;
        apiError.response = { data: responseData, status: status };
        throw apiError;
      } else if (error.request) {
        // The request was made but no response was received (e.g., network error)
        const requestError = new Error(
          "Twelve Labs API Error: No response received from server. " +
            error.message
        ) as TwelveLabsError;
        // error.request exists here, can be logged if needed: console.log(error.request);
        throw requestError;
      } else {
        // Something happened in setting up the request that triggered an Error
        const setupError = new Error(
          "Twelve Labs API Error: Error setting up request. " + error.message
        ) as TwelveLabsError;
        throw setupError;
      }
    } else {
      // Non-Axios error (e.g., an error thrown before the axios call)
      const genericError = new Error(
        "Failed to upload video: " + (error as Error).message
      ) as TwelveLabsError;
      throw genericError;
    }
  }
}

/**
 * Checks the status of a video processing task.
 * Still uses SDK for this example, but could be converted to REST API call too.
 * @param {string} taskId The ID of the task.
 * @returns {Promise<Task>} The task status object from Twelve Labs.
 */
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
    // Adjust error handling if SDK error structure is different from fetch error
    if (twelveLabsError.response && twelveLabsError.response.data) {
      const data = twelveLabsError.response.data;
      const message = typeof data === "string" ? data : data.message;
      throw new Error(
        "Twelve Labs API Error retrieving status: " +
          (message || JSON.stringify(data))
      );
    }
    throw new Error("Failed to retrieve status for task " + taskId + ".");
  }
}

// TODO: Add function for searching clips once video is indexed
// export async function searchClipsInVideo(indexId: string, videoId: string, query: string) { ... }

// --- New Interfaces and Function for Listing Videos (Re-added) ---
interface HLSData {
  video_url?: string;
  thumbnail_urls?: string[];
  status?: string;
  updated_at?: string;
}

export interface VideoTask {
  _id: string;
  index_id: string;
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
}

interface ListTasksResponse {
  data: VideoTask[];
  page_info: {
    limit: number;
    offset?: number;
    total_results: number;
    page?: number;
    total_pages?: number;
  };
}

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
    console.log(
      `Fetching processed videos (tasks) for index ID: ${indexId}, page: ${page}, limit: ${actualLimit}, sort: ${sortBy} ${sortOption}`
    );

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

    console.log(
      "Twelve Labs API List Tasks (Processed Videos) Response:",
      response.data
    );

    if (response.status === 200) {
      return response.data;
    } else {
      const errorData = response.data as any;
      console.error("Failed to list videos from Twelve Labs", errorData);
      throw new Error(
        `Failed to list videos: ${
          errorData?.message || response.statusText || "Unknown API error"
        } (Status: ${response.status})`
      );
    }
  } catch (error: any) {
    console.error("Error listing videos from Twelve Labs:", error);
    let errorMessage = "Error listing videos from Twelve Labs.";
    if (error.response) {
      console.error("Error response data:", error.response.data);
      const apiError = error.response.data as any;
      errorMessage = `Twelve Labs API Error: ${
        apiError?.message || error.response.statusText || "Unknown error"
      } (Status: ${error.response.status})`;
    } else if (error.request) {
      console.error("Error request:", error.request);
      errorMessage =
        "No response received from Twelve Labs API while listing videos.";
    } else {
      errorMessage = `Error in setting up list videos request: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};

// --- New Interface and Function for Searching Video Clips ---
export interface SearchClipData {
  score: number;
  start: number; // in seconds
  end: number; // in seconds
  video_id: string;
  confidence: "high" | "medium" | "low" | string; // string for future-proofing
  thumbnail_url?: string;
  // transcription?: string; // If available and needed
}

interface SearchAPIResponse {
  data: SearchClipData[];
  page_info: {
    limit_per_page?: number; // older API version or diff endpoint might use this
    page_limit?: number; // newer API version
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
  // Potentially other fields
}

export async function searchVideo(
  indexId: string,
  videoId: string, // To filter search to a specific video
  query: string,
  searchOptions: string[] = ["visual", "conversation"],
  pageLimit: number = 50 // Maximize results per call
): Promise<SearchClipData[]> {
  if (!TWELVE_LABS_API_KEY) {
    throw new Error("Twelve Labs API key is not configured.");
  }
  if (!indexId) {
    throw new Error("Index ID is required for searching.");
  }
  if (!videoId) {
    throw new Error("Video ID is required to scope the search.");
  }
  if (!query) {
    throw new Error("Search query is required.");
  }

  const formData = new FormData();
  formData.append("index_id", indexId);
  formData.append("query_text", query);

  // search_options needs to be appended for each option
  if (searchOptions && searchOptions.length > 0) {
    searchOptions.forEach((option) => {
      formData.append("search_options", option);
    });
  } else {
    // Append default if none provided, though API might have its own defaults
    formData.append("search_options", "visual");
    formData.append("search_options", "conversation");
  }

  formData.append("filter", JSON.stringify({ id: [videoId] }));
  formData.append("page_limit", pageLimit.toString());
  // Add other parameters as needed, like operator, group_by, sort_option, threshold
  // formData.append("operator", "or"); // Example

  console.log("Searching video with FormData. Fields appended:");
  // Manually log form data fields for debugging if possible (FormData doesn't have a direct .entries() or .values() in all Node versions like browser FormData)
  // For simple key-value pairs, you can iterate _streams if needed, but often logging the intent is enough.
  console.log(`  index_id: ${indexId}`);
  console.log(`  query_text: ${query}`);
  searchOptions.forEach((opt) => console.log(`  search_options: ${opt}`));
  console.log(`  filter: ${JSON.stringify({ id: [videoId] })}`);
  console.log(`  page_limit: ${pageLimit}`);

  try {
    const response = await axios.post<SearchAPIResponse>(
      `${TWELVE_LABS_BASE_URL}/search`,
      formData, // Pass FormData object directly
      {
        headers: {
          "x-api-key": TWELVE_LABS_API_KEY,
          ...formData.getHeaders(), // Use headers from FormData for multipart
        },
        maxBodyLength: Infinity, // Good practice for FormData uploads
        maxContentLength: Infinity,
      }
    );

    if (response.status === 200 && response.data && response.data.data) {
      console.log("Search successful. Clips found:", response.data.data.length);
      return response.data.data;
    } else {
      // Handle non-200 responses that don't throw an error by default from axios
      const errorDetail = response.data
        ? JSON.stringify(response.data)
        : response.statusText;
      throw new Error(
        `Failed to search video. Status: ${response.status}. Details: ${errorDetail}`
      );
    }
  } catch (error: any) {
    console.error("Error searching video in Twelve Labs:", error);
    let errorMessage = "Error searching video in Twelve Labs.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const apiError = error.response.data as any;
        errorMessage = `Twelve Labs API Search Error: ${
          apiError?.message || error.response.statusText || "Unknown error"
        } (Status: ${error.response.status})`;
      } else if (error.request) {
        errorMessage =
          "No response received from Twelve Labs API while searching video.";
      } else {
        errorMessage = `Error in setting up video search request: ${error.message}`;
      }
    }
    throw new Error(errorMessage);
  }
}
