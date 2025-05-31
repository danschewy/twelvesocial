import { NextRequest, NextResponse } from "next/server";
import { getManualIndexId, getVideoDetails } from "@/lib/twelvelabs.server";
import { extractClip } from "@/lib/ffmpeg";
import { v4 as uuidv4 } from "uuid";

interface ClipSegment {
  id: string;
  start: number;
  end: number;
}

interface GenerateClipRequestBody {
  videoId: string;
  segments: ClipSegment[];
}

interface GeneratedClipInfo {
  id?: string; // id from the input segment
  fileName: string;
  downloadUrl: string; // URL the client can use to download
  message: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateClipRequestBody = await req.json();
    const { videoId, segments } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { error: "At least one segment is required." },
        { status: 400 }
      );
    }

    console.log(`Generating ${segments.length} clips for video ${videoId}`);

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
          error: "Server configuration error for clip generation.",
          details: message,
        },
        { status: 500 }
      );
    }

    // 2. Get video details to verify it exists and get HLS URL
    let videoDetails;
    try {
      videoDetails = await getVideoDetails(indexId, videoId);
      console.log("Video details retrieved for clip generation");
    } catch (detailsError) {
      console.error("Failed to get video details:", detailsError);
      const message =
        detailsError instanceof Error
          ? detailsError.message
          : "Could not retrieve video details.";
      return NextResponse.json(
        { error: "Video not found or not accessible.", details: message },
        { status: 404 }
      );
    }

    // 3. Check if HLS URL is available for FFmpeg processing
    const hlsUrl = videoDetails.hls?.video_url;
    if (!hlsUrl) {
      return NextResponse.json(
        {
          error: "Video HLS stream not available for clip generation.",
          details: "The video must have an HLS stream URL to generate clips.",
        },
        { status: 400 }
      );
    }

    console.log("Using HLS URL for clip generation:", hlsUrl);

    // 4. Generate clips using FFmpeg
    const clipResults: GeneratedClipInfo[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const duration = segment.end - segment.start;
      const fileName = `clip_${i + 1}_${segment.start.toFixed(
        1
      )}s-${segment.end.toFixed(1)}s_${uuidv4().slice(0, 8)}.mp4`;

      try {
        console.log(
          `Generating clip ${i + 1}/${segments.length}: ${segment.start}s - ${
            segment.end
          }s`
        );

        // Use FFmpeg to extract the clip
        const clipData = await extractClip(
          hlsUrl,
          segment.start,
          segment.end,
          fileName
        );

        clipResults.push({
          id: segment.id,
          fileName: clipData.fileName,
          downloadUrl: `/api/download-clip?file=${encodeURIComponent(
            clipData.fileName
          )}`,
          message: `Clip generated successfully (${duration.toFixed(
            1
          )}s duration)`,
        });

        console.log(`Successfully generated clip: ${clipData.fileName}`);
      } catch (clipError) {
        console.error(`Failed to generate clip ${i + 1}:`, clipError);
        const errorMessage =
          clipError instanceof Error
            ? clipError.message
            : "Unknown FFmpeg error";

        clipResults.push({
          id: segment.id,
          fileName: fileName,
          downloadUrl: "",
          message: `Failed to generate clip (${duration.toFixed(1)}s duration)`,
          error: errorMessage,
        });
      }
    }

    const successfulClips = clipResults.filter((clip) => !clip.error).length;
    const failedClips = clipResults.length - successfulClips;

    console.log(
      `Clip generation complete: ${successfulClips} successful, ${failedClips} failed`
    );

    return NextResponse.json({
      message: `Clip generation complete. ${successfulClips} successful, ${failedClips} failed.`,
      data: clipResults,
      videoId: videoId,
      totalClips: clipResults.length,
      successfulClips,
      failedClips,
    });
  } catch (error) {
    console.error("Error in /api/generate-clip:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: "Failed to generate clips.", details: message },
      { status: 500 }
    );
  }
}
