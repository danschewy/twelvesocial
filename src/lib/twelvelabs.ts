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
 * Retrieves the manually specified Twelve Labs Index ID from environment variables.
 * @returns {Promise<string>} The Index ID.
 * @throws {Error} If the Index ID is not set.
 */
export async function getManualIndexId(): Promise<string> {
  const indexId = process.env.TWELVE_LABS_INDEX_ID;
  if (!indexId) {
    throw new Error(
      "TWELVE_LABS_INDEX_ID is not set in environment variables."
    );
  }
  // Optional: Validate index existence using an SDK call or another API call if needed
  // For now, we assume it's valid if set.
  console.log("Using manual Twelve Labs Index ID: " + indexId);
  return indexId;
}

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
      { headers: headers }
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
