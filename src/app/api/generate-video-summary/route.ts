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
  details?: string | object | null;
}

export async function POST(request: NextRequest) {
  try {
    // Using a type assertion here assuming the request structure is known and validated by the client or a middleware.
    // For more robustness, consider a validation library like Zod.
    const body = (await request.json()) as GenerateVideoSummaryRequestBody;
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
  } catch (error: unknown) {
    console.error("Error in /api/generate-video-summary:", error);
    let errorMessage = "Failed to generate video summary.";
    let errorDetails: string | object | null = null; // Allow object for more complex error details

    if (error instanceof Error) {
      errorMessage = error.message;
      // Safely check for additional properties on the error object
      if ("cause" in error && error.cause) {
        errorDetails =
          typeof error.cause === "string"
            ? error.cause
            : JSON.stringify(error.cause);
      } else if (
        "response" in error &&
        (error as { response: { data: unknown } }).response?.data
      ) {
        // This pattern is common for Axios errors, where 'response' is a property.
        // However, 'error' itself is an 'Error' instance, so 'response' isn't standard.
        // This might indicate a need to handle specific error types (e.g. AxiosError) differently.
        // For now, we'll keep the check, but it's a bit of a smell.
        errorDetails = (error as { response: { data: string | object } })
          .response.data;
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json<GenerateVideoSummaryErrorResponse>(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
