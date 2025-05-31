import { NextResponse } from "next/server";
import { getManualIndexId, searchVideo } from "@/lib/twelvelabs.server";
import { SearchClipData } from "@/lib/twelvelabs";

interface SearchClipsRequestBody {
  videoId: string;
  query: string;
  searchOptions?: string[];
  // indexId?: string; // Optional: if you want to allow overriding the default index from client
}

export async function POST(request: Request) {
  try {
    const body: SearchClipsRequestBody = await request.json();
    const { videoId, query, searchOptions } = body;

    if (!videoId) {
      return NextResponse.json(
        { message: "videoId is required." },
        { status: 400 }
      );
    }
    if (!query) {
      return NextResponse.json(
        { message: "query is required." },
        { status: 400 }
      );
    }

    // We get the indexId from the environment variable via getManualIndexId
    // If you were to allow indexId from client, you'd pass body.indexId to it.
    const indexIdToUse = await getManualIndexId();

    console.log(
      `API /search-clips: Searching in index '${indexIdToUse}', video '${videoId}' for query '${query}'`
    );

    const clips: SearchClipData[] = await searchVideo(
      indexIdToUse,
      videoId,
      query,
      searchOptions // Will default in searchVideo if undefined
    );

    return NextResponse.json({ data: clips }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in /api/search-clips:", error);
    let errorMessage = "Failed to search clips.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Failed to search clips.", details: errorMessage },
      { status: 500 }
    );
  }
}
