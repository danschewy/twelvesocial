import { NextResponse } from "next/server";
import {
  getManualIndexId,
  getVideoDetails as getVideoDetailsFromServer,
} from "@/lib/twelvelabs.server";
import { VideoDetails } from "@/lib/twelvelabs"; // Shared type

interface VideoDetailsParams {
  params: Promise<{
    videoId: string;
  }>;
}

export async function GET(
  request: Request, // Not used, but required by Next.js route handler signature
  { params }: VideoDetailsParams
) {
  const { videoId } = await params;

  if (!videoId) {
    return NextResponse.json(
      { message: "Video ID is required." },
      { status: 400 }
    );
  }

  try {
    const indexId = await getManualIndexId(); // Gets default index from server env
    const videoDetails: VideoDetails = await getVideoDetailsFromServer(
      indexId,
      videoId
    );
    return NextResponse.json(videoDetails, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching details for video ${videoId}:`, error);
    let errorMessage = "Failed to fetch video details.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Failed to fetch video details.", details: errorMessage },
      { status: 500 }
    );
  }
}
