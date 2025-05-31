import { NextRequest, NextResponse } from "next/server";
import {
  getManualIndexId,
  searchVideo,
} from "@/lib/twelvelabs.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, query, searchOptions } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 }
      );
    }

    console.log(`Searching video ${videoId} for: "${query}"`);

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
          error: "Server configuration error for video search.",
          details: message,
        },
        { status: 500 }
      );
    }

    // 2. Search the video using Twelve Labs
    let searchResults;
    try {
      const options = Array.isArray(searchOptions) 
        ? searchOptions 
        : ["visual", "audio"]; // Default search options - only visual and audio are supported by Twelve Labs
      
      searchResults = await searchVideo(
        indexId,
        videoId,
        query.trim(),
        options,
        50 // page limit
      );
      
      console.log(`Found ${searchResults.length} search results for query: "${query}"`);
    } catch (searchError) {
      console.error("Failed to search video:", searchError);
      const message =
        searchError instanceof Error
          ? searchError.message
          : "Video search failed.";
      return NextResponse.json(
        { error: "Video search failed.", details: message },
        { status: 500 }
      );
    }

    // 3. Return the search results
    return NextResponse.json({
      message: "Video search completed successfully.",
      data: searchResults,
      query: query.trim(),
      videoId: videoId,
      searchOptions: searchOptions,
    });
  } catch (error) {
    console.error("Error in /api/search-clips:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: "Failed to search video clips.", details: message },
      { status: 500 }
    );
  }
}
