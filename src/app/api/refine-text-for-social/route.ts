import { NextRequest, NextResponse } from "next/server";
import axios from "axios"; // Import axios
import { v4 as uuidv4 } from "uuid"; // For session_id if needed

// Remove direct OpenAI import if no longer used directly
// import { openai } from "@/lib/openai";

interface RefineTextRequestBody {
  textToRefine: string;
  // customPrompt is removed as the prompt is now in LangFlow
}

interface RefineTextResponse {
  refinedText: string;
}

interface RefineTextErrorResponse {
  error: string;
  details?: string | object | null;
}

// LangFlow payload based on your example
interface LangFlowRefinePayload {
  input_value: string;
  output_type: "chat"; // As per your example
  input_type: "chat"; // As per your example
  session_id?: string; // Optional
  // If your flow has specific named inputs within a component (e.g. "Tweaks")
  // it might look like: inputs: { your_input_name: string } instead of just input_value.
  // For now, sticking to your direct example.
}

// Interface for the serialized Langflow Message object, based on Langflow's Python Message class
interface LangflowSerializedMessage {
  text?: string; // This is the primary target for the refined text
  content?: string; // Fallback if text is not present but content is
  sender?: string;
  sender_name?: string;
  session_id?: string;
  data?: { text?: string; content?: string; [key: string]: any }; // For nested data if present
  // Add other fields from Langflow Message class if needed for other purposes
  [key: string]: any;
}

// Represents an individual component's output within the LangFlow response
interface LangflowComponentOutput {
  results?: {
    message?: LangflowSerializedMessage;
    [key: string]: any;
  };
  artifacts?: {
    message?: string; // Often contains the direct text output for ChatOutput
    [key: string]: any;
  };
  outputs?: {
    // The named outputs of the component itself
    message?: {
      // If the component has an output named "message"
      message?: string; // Actual text often nested here for ChatOutput
      text?: string; // Alternative nesting
      [key: string]: any;
    };
    [key: string]: any; // Other potential named outputs
  };
  component_display_name?: string;
  [key: string]: any;
}

// Updated LangFlowOutput interface based on actual response structure
interface LangFlowOutput {
  outputs?: Array<{
    // Outer outputs array (usually one element for the whole flow result)
    inputs?: any; // Inputs to the flow/first component block
    outputs?: Array<LangflowComponentOutput>; // Inner outputs array (outputs of components in the flow)
  }>;
  result?: {
    message?: LangflowSerializedMessage;
    text?: string;
    [key: string]: any;
  };
  raw_output?: string;
  session_id?: string;
  [key: string]: any;
}

const LANGFLOW_ENDPOINT = process.env.LANGFLOW_REFINE_TEXT_ENDPOINT;
// This should be your Application Token from LangFlow / Datastax Astra
const LANGFLOW_APPLICATION_TOKEN = process.env.LANGFLOW_APPLICATION_TOKEN;

export async function POST(request: NextRequest) {
  if (!LANGFLOW_ENDPOINT) {
    console.error(
      "LangFlow endpoint (LANGFLOW_REFINE_TEXT_ENDPOINT) is not configured."
    );
    return NextResponse.json<RefineTextErrorResponse>(
      {
        error:
          "Text refinement service is not configured on the server (endpoint missing).",
      },
      { status: 500 }
    );
  }
  if (!LANGFLOW_APPLICATION_TOKEN) {
    console.error(
      "LangFlow Application Token (LANGFLOW_APPLICATION_TOKEN) is not configured."
    );
    return NextResponse.json<RefineTextErrorResponse>(
      {
        error:
          "Text refinement service is not configured on the server (token missing).",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as RefineTextRequestBody;
    const { textToRefine } = body;

    if (!textToRefine) {
      return NextResponse.json<RefineTextErrorResponse>(
        { error: "textToRefine is required." },
        { status: 400 }
      );
    }

    // Construct the payload for LangFlow based on your example
    const langFlowPayload: LangFlowRefinePayload = {
      input_value: textToRefine,
      output_type: "chat",
      input_type: "chat",
      // session_id: uuidv4(), // You can enable this if your flow uses sessions and you want unique ones
    };

    console.log(
      "Sending request to LangFlow for text refinement... Endpoint:",
      LANGFLOW_ENDPOINT
    );
    console.log("LangFlow Payload:", JSON.stringify(langFlowPayload, null, 2));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LANGFLOW_APPLICATION_TOKEN}`,
    };

    const langFlowResponse = await axios.post<LangFlowOutput>(
      LANGFLOW_ENDPOINT,
      langFlowPayload,
      { headers }
    );

    console.log(
      "Received response from LangFlow:",
      JSON.stringify(langFlowResponse.data, null, 2)
    );

    let refinedText: string | undefined | null = null;
    const flowOutputs = langFlowResponse.data?.outputs;

    if (
      flowOutputs &&
      flowOutputs.length > 0 &&
      flowOutputs[0].outputs &&
      flowOutputs[0].outputs.length > 0
    ) {
      const componentOutput = flowOutputs[0].outputs[0]; // Get the first component's output

      // Attempt 1: From component's artifacts (most direct in your example for ChatOutput)
      if (typeof componentOutput.artifacts?.message === "string") {
        refinedText = componentOutput.artifacts.message;
      }
      // Attempt 2: From component's named "message" output, then its "message" property
      else if (typeof componentOutput.outputs?.message?.message === "string") {
        refinedText = componentOutput.outputs.message.message;
      }
      // Attempt 3: From component's named "message" output, then its "text" property
      else if (typeof componentOutput.outputs?.message?.text === "string") {
        refinedText = componentOutput.outputs.message.text;
      }
      // Attempt 4: From component's results (serialized Langflow Message object)
      else if (typeof componentOutput.results?.message?.text === "string") {
        refinedText = componentOutput.results.message.text;
      }
      // Attempt 5: Fallback to content in results.message if text is not present
      else if (typeof componentOutput.results?.message?.content === "string") {
        refinedText = componentOutput.results.message.content;
      }
    }

    // Fallback attempts if the primary nested structure isn't found or doesn't yield text
    if (!refinedText) {
      // Attempt 6: Simpler result structure (sometimes seen in other Langflow setups)
      if (typeof langFlowResponse.data?.result?.message?.text === "string") {
        refinedText = langFlowResponse.data.result.message.text;
      } else if (
        typeof langFlowResponse.data?.result?.message?.content === "string"
      ) {
        refinedText = langFlowResponse.data.result.message.content;
      } else if (typeof langFlowResponse.data?.result?.text === "string") {
        refinedText = langFlowResponse.data.result.text;
      }
      // Attempt 7: If the entire response might be the direct output string
      else if (typeof langFlowResponse.data?.raw_output === "string") {
        refinedText = langFlowResponse.data.raw_output;
      }
    }

    if (
      refinedText === null ||
      refinedText === undefined ||
      typeof refinedText !== "string"
    ) {
      console.error(
        "LangFlow response did not contain refined text in any expected location. Full response:",
        langFlowResponse.data
      );
      return NextResponse.json<RefineTextErrorResponse>(
        {
          error:
            "Failed to get refined text from LangFlow. Response structure might be unexpected or text is missing.",
          details: langFlowResponse.data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<RefineTextResponse>(
      { refinedText: refinedText.trim() },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error calling LangFlow API:", error);
    let errorMessage = "Failed to refine text using LangFlow service.";
    let errorDetails: string | object | null = null;

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message;
      errorDetails = error.response?.data || {
        message: error.message,
        status: error.response?.status,
      };
    } else if (error instanceof Error) {
      errorMessage = error.message;
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
