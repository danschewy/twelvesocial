import { NextResponse } from "next/server";
import {
  getManualIndexId, // Ensure this is the updated version
  listProcessedVideosInIndex,
  // VideoTask is exported from lib/twelvelabs but not directly used in this file's logic
} from "@/lib/twelvelabs";

interface ListVideosQuery {
  indexId?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOption?: string;
}

// Define a type for the keys of ListVideosQuery to ensure type safety
type ListVideosQueryKeys = keyof ListVideosQuery;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: Partial<ListVideosQuery> = {}; // Use Partial for building the query object
  searchParams.forEach((value, key) => {
    const queryKey = key as ListVideosQueryKeys;
    if (key in query) {
      // This check is a bit redundant if keys are unique, but good for safety
      // Potentially handle duplicate keys if necessary, though typically they overwrite or append
    }
    query[queryKey] = value;
  });

  try {
    const indexIdToUse = await getManualIndexId(query.indexId);

    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const sortBy = query.sortBy || "created_at";
    const sortOption =
      query.sortOption === "asc" || query.sortOption === "desc"
        ? query.sortOption
        : "desc";

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { message: "Invalid page number." },
        { status: 400 }
      );
    }
    // Max limit from Twelve Labs API is 50
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { message: "Invalid limit value. Must be between 1 and 50." },
        { status: 400 }
      );
    }

    const result = await listProcessedVideosInIndex(
      indexIdToUse,
      page,
      limit,
      sortBy,
      sortOption
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in /api/list-videos:", error);
    let errorMessage = "Failed to list videos.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Failed to list videos.", details: errorMessage },
      { status: 500 }
    );
  }
}
