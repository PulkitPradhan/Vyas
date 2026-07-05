"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { chatbotAnswer, type ChatInput } from "@/lib/ai/gemini";
import { getFacilityAvailability } from "./queries";

// Patient chatbot responder — invoked from the public page. No auth. The
// patient's anonymous session token is generated client-side and logged here
// against chat_logs.patient_session (no identity).

export async function askChatbot(
  input: { query: string; language: "en" | "hi"; facilityId?: string; patientSession: string }
): Promise<{ answer: string | null; grounded: boolean }> {
  // Grounding: only the facility referenced (if any) is handed to the model.
  // The model is instructed (Phase 8) NOT to invent facility names/numbers.
  let facilityData: ChatInput["facilityData"] = null;
  if (input.facilityId) {
    const avail = await getFacilityAvailability(input.facilityId);
    const supabase = await createServerClient();
    const { data: f } = await supabase
      .from("facilities")
      .select("name")
      .eq("id", input.facilityId)
      .maybeSingle();
    facilityData = f
      ? {
          facilityName: f.name as string,
          stock: avail.stock,
          beds: avail.beds ?? { total: 0, occupied: 0 },
          tests: avail.tests,
        }
      : null;
  }

  const answer = await chatbotAnswer({
    query: input.query,
    language: input.language,
    facilityData,
  });

  // Off-diary: log this patient interaction. The chat_logs table is
  // insertable by anyone (RLS anon insert policy — Phase 1). Use the service
  // client so a missing anon insert capability in some Supabase config doesn't
  // break the user's reply flow.
  try {
    const svc = createServiceClient();
    await svc.from("chat_logs").insert({
      facility_id: input.facilityId ?? null,
      patient_session: input.patientSession,
      language: input.language,
      message: input.query,
      response: answer,
    });
  } catch (err) {
    console.error("chat_logs insert failed (non-fatal)", err);
  }

  return { answer, grounded: !!facilityData };
}
