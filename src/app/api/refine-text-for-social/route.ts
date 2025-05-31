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
  details?: string | object | null;
}

export async function POST(request: NextRequest) {
  try {
    // Using a type assertion here assuming the request structure is known and validated by the client or a middleware.
    // For more robustness, consider a validation library like Zod.
    const body = (await request.json()) as RefineTextRequestBody;
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
  } catch (error: unknown) {
    console.error("Error in /api/refine-text-for-social:", error);
    let errorMessage = "Failed to refine text for social media.";
    let errorDetails: string | object | null = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      // Safely check for additional properties
      // OpenAI/Axios errors often have a `response` property with `data`
      if (
        "response" in error &&
        (error as { response: { data: unknown } }).response?.data
      ) {
        errorDetails = (error as { response: { data: string | object } })
          .response.data; // This could be an object
      } else if ("cause" in error && error.cause) {
        errorDetails =
          typeof error.cause === "string"
            ? error.cause
            : JSON.stringify(error.cause);
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json<RefineTextErrorResponse>(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
