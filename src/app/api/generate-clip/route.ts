import { NextRequest, NextResponse } from "next/server";
import { getVideoDetails } from "@/lib/twelvelabs.server"; // Assuming getVideoDetails is the correct function from your server file
import { extractClip } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

interface ClipSegment {
  id?: string; // Optional ID for the segment, could be original search result ID
  start: number;
  end: number;
}

interface GenerateClipRequestBody {
  videoId: string;
  segments: ClipSegment[];
  indexId?: string; // Optional, if you need to specify index not from env
}

interface GeneratedClipInfo {
  id?: string; // id from the input segment
  fileName: string;
  downloadUrl: string; // URL the client can use to download
  message: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateClipRequestBody = await request.json();
    const { videoId, segments, indexId: queryIndexId } = body;

    if (!videoId) {
      return NextResponse.json(
        { message: "videoId is required." },
        { status: 400 }
      );
    }
    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { message: "At least one segment is required." },
        { status: 400 }
      );
    }

    // 1. Get Video Details (including HLS URL)
    // Assuming getManualIndexId is available in twelvelabs.server.ts or using a default
    // For simplicity, let's assume getVideoDetails can get the indexId if not provided
    // or you have a way to get the default indexId.
    // You might need to adjust this part based on your actual getManualIndexId and getVideoDetails setup.
    const defaultIndexId = process.env.TWELVE_LABS_INDEX_ID;
    const indexIdToUse = queryIndexId || defaultIndexId;

    if (!indexIdToUse) {
      return NextResponse.json(
        { message: "Index ID could not be determined." },
        { status: 500 }
      );
    }

    const videoDetails = await getVideoDetails(indexIdToUse, videoId);
    if (!videoDetails?.hls?.video_url) {
      return NextResponse.json(
        { message: "HLS stream URL for the video could not be found." },
        { status: 404 }
      );
    }
    const sourceHlsUrl = videoDetails.hls.video_url;
    const originalFileName = videoDetails.system_metadata?.filename || videoId;

    // 2. Process each segment
    const generatedClips: GeneratedClipInfo[] = [];
    const processingPromises = segments.map(async (segment, index) => {
      const clipFileName = `clip_${
        path.parse(originalFileName).name
      }_${segment.start.toFixed(0)}-${segment.end.toFixed(
        0
      )}_${uuidv4().substring(0, 8)}.mp4`;
      try {
        const { filePath, fileName } = await extractClip(
          sourceHlsUrl,
          segment.start,
          segment.end,
          clipFileName
        );
        // For now, the download URL will point to another API route that serves the file
        generatedClips.push({
          id: segment.id,
          fileName: fileName,
          downloadUrl: `/api/download-clip?file=${encodeURIComponent(
            fileName
          )}`,
          message: "Clip generated successfully.",
        });
      } catch (error) {
        console.error(`Error generating clip for segment ${index}:`, error);
        generatedClips.push({
          id: segment.id,
          fileName: clipFileName, // Still provide a filename for reference
          downloadUrl: "",
          message: `Failed to generate clip for segment (start: ${segment.start}, end: ${segment.end}).`,
          error:
            error instanceof Error ? error.message : "Unknown FFmpeg error",
        });
      }
    });

    await Promise.all(processingPromises); // Wait for all clips to be processed

    return NextResponse.json({ data: generatedClips }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in /api/generate-clip:", error);
    let errorMessage = "Failed to generate clips.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Failed to generate clips.", details: errorMessage },
      { status: 500 }
    );
  }
}
