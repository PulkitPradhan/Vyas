"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

// ===========================================================================
// Generative layer — Stage 3 of the AI pipeline (DESIGN.md §7, ADR-006).
// Gemini via OpenRouter (free tier). Three narrow functions share one client
// so a future provider swap touches only this file (ADR-006 exit path).
//
// Failure isolation (ADR-005): the deterministic forecast/flagging logic in
// Phase 6/7 does NOT call this module. Downstream callers (the flagging
// runner, the dashboard, the chatbot) invoke these lazily and degrade
// gracefully: a Gemini outage leaves the raw number/severity in place; only
// the friendly sentence is missing.
// ===========================================================================

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

interface LLMMessage {
  role: "system" | "user";
  content: string;
}

// Centralized, typed completion caller. Throws on network/HTTP/parse failure;
// every public function below wraps it in try/catch so its own contract is
// "return null on failure, never throw".
async function complete(
  messages: LLMMessage[],
  opts: { maxTokens?: number; temperature?: number; responseJson?: boolean } = {}
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set — generative AI degraded");
    return null;
  }

  const body = {
    model: MODEL,
    messages,
    max_tokens: opts.maxTokens ?? 256,
    temperature: opts.temperature ?? 0.2,
    ...(opts.responseJson ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Vyas",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("OpenRouter HTTP", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text : null;
  } catch (err) {
    console.error("OpenRouter fetch failed", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Function 1 — Explanation Generator
// ---------------------------------------------------------------------------
export interface FlagExplanationInput {
  flagId: string;
  category: "stock" | "bed" | "doctor" | "test";
  severity: "critical" | "warning" | "watch";
  facilityName: string;
  // Stock-specific structured context:
  itemName?: string;
  daysToZero?: number | null;
  currentQty?: number;
  // Bed-specific:
  occupied?: number;
  total?: number;
  // Doctor-specific:
  // (no extra fields beyond facilityName for now)
  // Test-specific:
  testName?: string;
}

export interface FlagExplanationResult {
  en: string | null;
  hi: string | null;
}

export async function generateFlagExplanation(
  input: FlagExplanationInput
): Promise<FlagExplanationResult> {
  const ctx = buildExplanationContext(input);
  const prompt = [
    {
      role: "system" as const,
      content:
        "You are a concise bilingual (English + Hindi) operations assistant for a district health officer. " +
        "Given structured numbers about a flagged facility, output EXACTLY two lines: one English sentence (prefix 'EN: ') and one Hindi sentence (prefix 'HI: '), each under 25 words. " +
        "Be plain-language and actionable. Use the numbers given, do not invent facility names or extra metrics.",
    },
    { role: "user" as const, content: ctx },
  ];

  const text = await complete(prompt, { temperature: 0.2, maxTokens: 160 });
  if (!text) return { en: null, hi: null };

  // Parse the two prefixed lines defensively.
  const enMatch = text.match(/EN:\s*(.+)/i);
  const hiMatch = text.match(/HI:\s*(.+)/i);
  return {
    en: enMatch ? enMatch[1].trim().split(/\n/)[0].trim() : null,
    hi: hiMatch ? hiMatch[1].trim().split(/\n/)[0].trim() : null,
  };
}

function buildExplanationContext(i: FlagExplanationInput): string {
  const severityWord =
    i.severity === "critical"
      ? "CRITICAL"
      : i.severity === "warning"
      ? "WARNING"
      : "WATCH";
  const base = `Facility: ${i.facilityName}. Severity: ${severityWord}.`;
  let detail = "";
  if (i.category === "stock") {
    detail = `Item: ${i.itemName ?? "a medicine"}. Current stock: ${i.currentQty ?? "?"} units. Projected stock-out in ${i.daysToZero?.toFixed(1) ?? "?"} days at the current 14-day consumption rate.`;
  } else if (i.category === "bed") {
    detail = `Beds: ${i.occupied ?? "?"} occupied of ${i.total ?? "?"} total — fully occupied / near capacity.`;
  } else if (i.category === "doctor") {
    detail = `No doctor has checked in past today's cutoff time (no prior notice recorded).`;
  } else if (i.category === "test") {
    detail = `Test / equipment '${i.testName ?? "a test"}' is currently non-functional.`;
  }
  return `${base}\n${detail}\n\nRespond with:\nEN: <one English sentence>\nHI: <one Hindi sentence>`;
}

// Best-effort: write explanation back to the flag row. Isolated — if the LLM
// call or the write fails, the flag row (with its raw severity) remains intact
// and the dashboard shows the raw number instead of a blank space (Phase 10).
export async function explainAndStoreFlag(
  input: FlagExplanationInput
): Promise<void> {
  const { en, hi } = await generateFlagExplanation(input);
  if (!en && !hi) return; // graceful degradation

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("flags")
    .update({ reason_text_en: en, reason_text_hi: hi })
    .eq("id", input.flagId);
  if (error) console.error("flag explanation store failed", error);
}

// ---------------------------------------------------------------------------
// Function 2 — Voice/Chat Intent Parser
// ---------------------------------------------------------------------------
export const IntentSchema = z.object({
  action: z.enum(["deplete", "restock", "lookup", "unknown"]),
  item: z.string().min(1).max(80),
  quantity: z.number().int().min(0).max(100000),
  facility: z.string().min(1).max(80).optional(),
  confidence: z.enum(["high", "low"]),
});

export type ParsedIntent = z.infer<typeof IntentSchema>;

// Parse a Hindi/English/code-switched utterance into a strict structured
// intent. Schema-validated before it's allowed near a write path (DESIGN.md §7
// "Input validation as a safety boundary"). low-confidence / invalid =>
// returns null and the caller surfaces it for user confirmation (Phase 9/10).
export async function parseIntent(
  transcript: string
): Promise<ParsedIntent | null> {
  const prompt: LLMMessage[] = [
    {
      role: "system",
      content:
        "You are a strict parser. Convert a pharmacist's spoken or typed update (Hindi, English, or mixed) into JSON only. " +
        'Output a single JSON object with fields: action ("deplete"|"restock"|"lookup"|"unknown"), item (medicine name), quantity (integer), facility (name, optional), confidence ("high"|"low"). ' +
        'Examples — "Paracetamol khatam" => {"action":"deplete","item":"Paracetamol","quantity":0,"confidence":"high"}; ' +
        '"ICT 10 aaj" => {"action":"restock","item":"ICT","quantity":10,"confidence":"high"}; ' +
        '"Rampur PHC mein paracetamol hai kya" => {"action":"lookup","item":"Paracetamol","facility":"Rampur PHC","quantity":0,"confidence":"high"}. ' +
        'If the meaning is ambiguous, use "unknown"/"low". No prose, JSON only.',
    },
    { role: "user", content: transcript.trim() },
  ];

  const text = await complete(prompt, { temperature: 0.0, maxTokens: 120, responseJson: true });
  if (!text) return null;

  try {
    const raw = JSON.parse(text);
    return IntentSchema.parse(raw);
  } catch (err) {
    console.warn("intent parse failed", err, text);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Function 3 — Patient Chatbot Responder
// ---------------------------------------------------------------------------
export interface ChatInput {
  query: string;
  language: "en" | "hi";
  // The grounded facility data the model is allowed to reference. The model
  // MUST not invent facility names or numbers not in this payload.
  facilityData: {
    facilityName: string;
    stock: { item_name: string; quantity: number; unit: string }[];
    beds: { total: number; occupied: number };
    tests: { test_name: string; is_functional: boolean }[];
  } | null;
}

// Read-only grounding: the model answers only from the provided facility data.
// Returns a bilingual-ish natural answer matching the query language. Null on
// provider failure — the caller shows a concise fallback ("couldn't reach the
// assistant, here are the raw numbers: …").
export async function chatbotAnswer(input: ChatInput): Promise<string | null> {
  const langInstruction =
    input.language === "hi"
      ? "Respond in Hindi."
      : "Respond in English.";
  const dataBlock = input.facilityData
    ? JSON.stringify({
        facility: input.facilityData.facilityName,
        stock: input.facilityData.stock,
        beds: input.facilityData.beds,
        tests: input.facilityData.tests,
      })
    : "No facility data available for this query.";

  const prompt: LLMMessage[] = [
    {
      role: "system",
      content:
        "You are a patient-facing availability assistant for a district health system. " +
        "Answer ONLY from the facility data provided below. Do NOT invent facility names, quantities, or test statuses. " +
        `${langInstruction} Keep it under 30 words and plain-language. If the data is missing, say so.`,
    },
    {
      role: "user",
      content: `Patient query: "${input.query}"\n\nFacility data (authoritative):\n${dataBlock}`,
    },
  ];

  return complete(prompt, { temperature: 0.2, maxTokens: 220 });
}

// ---------------------------------------------------------------------------
// Public surface (single interface for a future provider swap per ADR-006).
// ---------------------------------------------------------------------------
export const gemini = {
  explainAndStoreFlag,
  generateFlagExplanation,
  parseIntent,
  chatbotAnswer,
  MODEL,
};
