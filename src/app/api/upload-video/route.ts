import { NextRequest, NextResponse } from "next/server";
import {
  getManualIndexId,
  uploadVideoToIndex,
  // getVideoProcessingStatus, // We might need another endpoint for status checking
} from "@/lib/twelvelabs.server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided." },
        { status: 400 }
      );
    }

    // Validate file type (optional, but good practice)
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    console.log(
      `Received video file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
    );

    // 1. Get the manually configured Index ID
    let indexId: string;
    try {
      indexId = await getManualIndexId();
      console.log("Using Twelve Labs Index ID:", indexId);
    } catch (indexError) {
      console.error("Failed to get Twelve Labs Index ID:", indexError);
      const message =
        indexError instanceof Error
          ? indexError.message
          : "Could not retrieve index configuration.";
      return NextResponse.json(
        {
          error: "Server configuration error for video indexing.",
          details: message,
        },
        { status: 500 }
      );
    }

    // 2. Upload the video to Twelve Labs
    let taskId: string;
    try {
      // The uploadVideoToIndex function expects a File object directly
      taskId = await uploadVideoToIndex(indexId, file);
      console.log(`Video uploaded to Twelve Labs. Task ID: ${taskId}`);
    } catch (uploadError) {
      console.error("Failed to upload video to Twelve Labs:", uploadError);
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Video upload to processing service failed.";
      return NextResponse.json(
        { error: "Video upload failed.", details: message },
        { status: 500 }
      );
    }

    // 3. Return the taskId to the client
    // The client can then use this taskId to poll for processing status
    return NextResponse.json({
      message: "Video upload initiated successfully.",
      taskId: taskId,
    });
  } catch (error) {
    console.error("Error in /api/upload-video:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: "Failed to process video upload.", details: message },
      { status: 500 }
    );
  }
}
