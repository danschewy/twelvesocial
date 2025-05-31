import { NextRequest, NextResponse } from "next/server";
import { generateVideoSummary } from "@/lib/twelvelabs.server";
import type { VideoSummaryData } from "@/lib/twelvelabs";

interface GenerateVideoSummaryRequestBody {
  videoId: string;
  prompt?: string;
  temperature?: number;
}

interface GenerateVideoSummaryErrorResponse {
  error: string;
  details?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateVideoSummaryRequestBody = await request.json();
    const { videoId, prompt, temperature } = body;

    if (!videoId) {
      return NextResponse.json<GenerateVideoSummaryErrorResponse>(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    const summaryData = await generateVideoSummary(
      videoId,
      prompt,
      temperature
    );

    return NextResponse.json<VideoSummaryData>(summaryData, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/generate-video-summary:", error);
    return NextResponse.json<GenerateVideoSummaryErrorResponse>(
      {
        error: error.message || "Failed to generate video summary.",
        details:
          error.cause ||
          (error.response?.data ? JSON.stringify(error.response.data) : null),
      },
      { status: 500 }
    );
  }
}
