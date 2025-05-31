import { NextRequest, NextResponse } from "next/server";
import { generateVideoSummary } from "@/lib/twelvelabs.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    console.log(`Analyzing video: ${videoId}`);

    // Generate comprehensive video summary
    const summaryData = await generateVideoSummary(
      videoId,
      "Provide a comprehensive analysis of this video including: 1) Main topics and themes, 2) Key moments or highlights, 3) Type of content (tutorial, interview, presentation, etc.), 4) Potential social media clip opportunities, 5) Notable quotes or statements, 6) Visual elements or scenes that stand out. Be specific and detailed.",
      0.3 // Lower temperature for more consistent analysis
    );

    // Parse and structure the analysis
    const analysis = {
      summary: summaryData.summary,
      videoId: videoId,
      analyzedAt: new Date().toISOString(),
      // Extract structured insights from the summary
      insights: extractInsights(summaryData.summary),
    };

    console.log("Video analysis completed:", analysis);

    return NextResponse.json({
      success: true,
      analysis: analysis,
    });
  } catch (error) {
    console.error("Error analyzing video:", error);

    let errorMessage = "Failed to analyze video.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Video analysis service configuration error.";
        statusCode = 503;
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Too many analysis requests. Please try again later.";
        statusCode = 429;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: "Video analysis failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

// Helper function to extract structured insights from summary
function extractInsights(summary: string) {
  const insights = {
    contentType: "general",
    keyTopics: [] as string[],
    suggestedClips: [] as string[],
    hasQuotes: false,
    hasVisualElements: false,
    estimatedClipCount: 3,
  };

  const lowerSummary = summary.toLowerCase();

  // Determine content type
  if (lowerSummary.includes("tutorial") || lowerSummary.includes("how to") || lowerSummary.includes("step")) {
    insights.contentType = "tutorial";
    insights.estimatedClipCount = 4;
  } else if (lowerSummary.includes("interview") || lowerSummary.includes("conversation") || lowerSummary.includes("discussion")) {
    insights.contentType = "interview";
    insights.estimatedClipCount = 5;
  } else if (lowerSummary.includes("presentation") || lowerSummary.includes("demo") || lowerSummary.includes("product")) {
    insights.contentType = "presentation";
    insights.estimatedClipCount = 4;
  }

  // Check for quotes
  insights.hasQuotes = lowerSummary.includes("quote") || lowerSummary.includes("says") || lowerSummary.includes("mentions");

  // Check for visual elements
  insights.hasVisualElements = lowerSummary.includes("shows") || lowerSummary.includes("displays") || lowerSummary.includes("visual");

  // Extract potential topics (simple keyword extraction)
  const topicKeywords = [
    "innovation", "technology", "business", "marketing", "sales", "product", "feature",
    "strategy", "growth", "success", "tips", "advice", "insights", "experience",
    "project", "development", "design", "process", "method", "technique"
  ];

  insights.keyTopics = topicKeywords.filter(keyword => 
    lowerSummary.includes(keyword)
  ).slice(0, 5);

  // Generate suggested clips based on content type
  switch (insights.contentType) {
    case "tutorial":
      insights.suggestedClips = [
        "Introduction and overview",
        "Key steps and process",
        "Tips and best practices",
        "Final results and conclusion"
      ];
      break;
    case "interview":
      insights.suggestedClips = [
        "Best quotes and insights",
        "Key discussion points",
        "Personal stories or examples",
        "Advice and recommendations",
        "Most engaging moments"
      ];
      break;
    case "presentation":
      insights.suggestedClips = [
        "Main value proposition",
        "Key features or benefits",
        "Compelling statistics or data",
        "Call to action"
      ];
      break;
    default:
      insights.suggestedClips = [
        "Most engaging moments",
        "Key highlights",
        "Notable quotes or statements",
        "Visual highlights"
      ];
  }

  return insights;
} 