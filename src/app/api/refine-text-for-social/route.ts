import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai"; // Assuming openai client is exported from here

interface RefineTextRequestBody {
  textToRefine: string;
  customPrompt?: string; // Optional: if we want to allow custom prompts later
}

interface RefineTextResponse {
  refinedText: string;
}

interface RefineTextErrorResponse {
  error: string;
  details?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefineTextRequestBody = await request.json();
    const { textToRefine, customPrompt } = body;

    if (!textToRefine) {
      return NextResponse.json<RefineTextErrorResponse>(
        { error: "textToRefine is required." },
        { status: 400 }
      );
    }

    if (!openai) {
      console.error(
        "OpenAI client is not initialized. Check API key and lib/openai.ts"
      );
      return NextResponse.json<RefineTextErrorResponse>(
        {
          error: "OpenAI client is not available. Server configuration issue.",
        },
        { status: 500 }
      );
    }

    const systemMessage =
      "You are an expert social media content creator. \
You are given a summary of a video. Your task is to transform this summary into a concise and engaging social media post. \
The post should be ideally 2-3 sentences long. \
Include relevant emojis and 2-3 relevant hashtags. \
Make it catchy and shareable.";

    const userMessage = `Here is the video summary:

${textToRefine}

Please generate a social media post based on this.`;

    console.log("Sending request to OpenAI for text refinement...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or your preferred model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: customPrompt || userMessage },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const refinedText = completion.choices[0]?.message?.content?.trim();

    if (!refinedText) {
      console.error(
        "OpenAI response did not contain refined text:",
        completion
      );
      return NextResponse.json<RefineTextErrorResponse>(
        {
          error: "Failed to get refined text from OpenAI. Response was empty.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<RefineTextResponse>(
      { refinedText },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/refine-text-for-social:", error);
    let errorMessage = "Failed to refine text for social media.";
    let errorDetails = null;

    if (error.response) {
      // Axios error structure
      errorMessage = error.response.data?.error?.message || error.message;
      errorDetails = error.response.data;
    } else if (error.message) {
      // General error
      errorMessage = error.message;
    }

    return NextResponse.json<RefineTextErrorResponse>(
      {
        error: errorMessage,
        details:
          errorDetails || (error.cause ? JSON.stringify(error.cause) : null),
      },
      { status: 500 }
    );
  }
}
