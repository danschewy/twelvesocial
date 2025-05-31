import { CreateTaskParams, Task, TwelveLabs } from "twelvelabs-js"; // Assuming Index type is exported
import { Readable } from "stream";

const apiKey = process.env.TWELVE_LABS_API_KEY;
const manualIndexIdFromEnv = process.env.TWELVE_LABS_INDEX_ID;

if (!apiKey) {
  throw new Error(
    "Missing Twelve Labs API Key. TWELVE_LABS_API_KEY must be set in .env.local"
  );
}
if (!manualIndexIdFromEnv) {
  throw new Error(
    "Missing Twelve Labs Index ID. TWELVE_LABS_INDEX_ID must be set in .env.local as you are using a manually created index."
  );
}

// At this point, manualIndexIdFromEnv is guaranteed to be a string.
const manualIndexId: string = manualIndexIdFromEnv;

// Let TypeScript infer the client type
const twelveLabsClient = new TwelveLabs({ apiKey });

interface TwelveLabsErrorResponseData {
  message?: string;
  // Add other potential fields from Twelve Labs error responses
}

interface TwelveLabsError extends Error {
  response?: {
    data?: TwelveLabsErrorResponseData | string; // data can be an object or sometimes a string
  };
}

/**
 * Retrieves the manually specified Twelve Labs index by ID.
 * @returns {Promise<string>} The ID of the index.
 */
export async function getManualIndexId(): Promise<string> {
  try {
    // Verify the index exists and we can access it
    console.log(
      `Attempting to retrieve manually specified index with ID: ${manualIndexId}...`
    );
    const index = await twelveLabsClient.index.retrieve(manualIndexId);
    console.log(
      `Successfully retrieved index: ${index.name} (ID: ${index.id})`
    );
    return index.id;
  } catch (error) {
    console.error(
      `Error retrieving manually specified Twelve Labs index (ID: ${manualIndexId}):`,
      error
    );
    const twelveLabsError = error as TwelveLabsError;
    if (twelveLabsError.response && twelveLabsError.response.data) {
      const data = twelveLabsError.response.data;
      const message = typeof data === "string" ? data : data.message;
      throw new Error(
        `Twelve Labs API Error retrieving index: ${
          message || JSON.stringify(data)
        }`
      );
    }
    throw new Error(
      "Failed to retrieve the specified Twelve Labs index. Please check TWELVE_LABS_INDEX_ID."
    );
  }
}

/**
 * Uploads a video file to the specified Twelve Labs index.
 * @param {string} indexId The ID of the index to upload to.
 * @param {File} videoFile The video file to upload.
 * @param {string} [language="en"] The language of the video.
 * @returns {Promise<string>} The ID of the video processing task.
 */
export async function uploadVideoToIndex(
  indexId: string,
  videoFile: File
  // language: string = "en" // Commenting out language due to CreateTaskParams linter error
): Promise<string> {
  try {
    console.log(`Uploading video "${videoFile.name}" to index ${indexId}...`);
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const videoStream = Readable.from(buffer);

    const taskParams: CreateTaskParams = {
      indexId: indexId,
      file: videoStream,
      // language: language, // Temporarily removed
    };

    // console.log("Task params being sent to Twelve Labs:", taskParams);
    const task = await twelveLabsClient.task.create(taskParams);

    console.log(`Video upload initiated. Task ID: ${task.id}`);
    return task.id;
  } catch (error) {
    console.error("Error uploading video to Twelve Labs:", error);
    const twelveLabsError = error as TwelveLabsError;
    if (twelveLabsError.response && twelveLabsError.response.data) {
      const data = twelveLabsError.response.data;
      const message = typeof data === "string" ? data : data.message;
      throw new Error(
        `Twelve Labs API Error during upload: ${
          message || JSON.stringify(data)
        }`
      );
    }
    throw new Error("Failed to upload video to Twelve Labs.");
  }
}

/**
 * Checks the status of a video processing task.
 * @param {string} taskId The ID of the task.
 * @returns {Promise<any>} The task status object from Twelve Labs.
 */
export async function getVideoProcessingStatus(taskId: string): Promise<Task> {
  try {
    const taskStatus = await twelveLabsClient.task.retrieve(taskId);
    console.log(`Task ${taskId} status: ${taskStatus.status}`);
    return taskStatus; // Return the full status object
  } catch (error) {
    console.error(`Error retrieving status for task ${taskId}:`, error);
    const twelveLabsError = error as TwelveLabsError;
    if (twelveLabsError.response && twelveLabsError.response.data) {
      const data = twelveLabsError.response.data;
      const message = typeof data === "string" ? data : data.message;
      throw new Error(
        `Twelve Labs API Error retrieving status: ${
          message || JSON.stringify(data)
        }`
      );
    }
    throw new Error("Failed to get video processing status.");
  }
}

// TODO: Add function for searching clips once video is indexed
// export async function searchClipsInVideo(indexId: string, videoId: string, query: string) { ... }
