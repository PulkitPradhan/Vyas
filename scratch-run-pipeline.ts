import { complete } from "./lib/ai/gemini";
import { runAgent } from "./lib/ai/agent";
import { processMessagePipeline } from "./lib/ats/pipeline";
import { createServer } from "http";

// Mock env
process.env.OPENROUTER_API_KEY = "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";
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://mock-supabase.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-key";

async function test() {
  try {
    const res = await processMessagePipeline("What is paracetamol?", "web", "session123");
    console.log("PIPELINE SUCCESS:", res);
  } catch (err) {
    console.error("PIPELINE ERROR:", err);
  }
}

test();
