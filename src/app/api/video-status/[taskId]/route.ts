import { NextRequest, NextResponse } from "next/server";
import { getVideoProcessingStatus } from "@/lib/twelvelabs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

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
    // - metadata (like filename, duration etc. if available and serializable)
    // - created_at, updated_at

    // We need to ensure the response structure matches what VideoUploader.tsx expects for `data.videoId` and `data.status`
    // Explicitly pick only the necessary and serializable fields.
    const responsePayload = {
      taskId: statusData.id,
      status: statusData.status,
      videoId: statusData.videoId || null,
      // Add any other specific, serializable fields you need on the client:
      // e.g., filename: statusData.metadata?.filename,
      // e.g., createdAt: statusData.created_at,
      // e.g., updatedAt: statusData.updated_at,
    };

    return NextResponse.json(responsePayload);
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
