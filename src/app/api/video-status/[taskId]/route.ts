import { NextRequest, NextResponse } from "next/server";
import { getVideoProcessingStatus } from "@/lib/twelvelabs";

interface RouteParams {
  params: {
    taskId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { taskId } = params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID is required." },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching status for Twelve Labs Task ID: ${taskId}`);
    const statusData = await getVideoProcessingStatus(taskId);

    // The statusData from twelveLabsClient.task.retrieve(taskId) is expected to contain:
    // - id (task_id)
    // - video_id (this is the actual ID of the video in Twelve Labs once processed)
    // - status ('pending', 'processing', 'ready', 'failed')
    // - ... and other metadata.

    // We need to ensure the response structure matches what VideoUploader.tsx expects for `data.videoId` and `data.status`
    return NextResponse.json({
      taskId: statusData.id, // Echo back the task id
      videoId: statusData.video_id, // This is crucial for the frontend
      status: statusData.status,
      metadata: statusData.metadata, // Include other relevant info if needed
      fullResponse: statusData, // Optionally, send the whole response for debugging or richer client-side info
    });
  } catch (error) {
    console.error(`Error fetching status for task ${taskId}:`, error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get video processing status.";
    // It's important to distinguish client errors (e.g., task not found, which might be a 404) from server errors (500)
    // For simplicity, returning 500 for all errors from this backend part.
    return NextResponse.json(
      { error: "Failed to fetch video status.", details: message },
      { status: 500 }
    );
  }
}
