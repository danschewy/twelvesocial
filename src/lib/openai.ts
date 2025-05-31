import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API Key. Make sure OPENAI_API_KEY is set in your .env.local file."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// You can add more functions here if needed, for example, to directly interact with specific models
// or to handle specific types of requests outside of LangChain if necessary.
