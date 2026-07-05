import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";

// Hermetic tests for the generative layer's contract — no live network calls.
// We stub global.fetch so the OpenRouter request is deterministic and the test
// asserts only the schema-validation + failure-isolation behaviour that
// ADR-005 / ADR-006 demand.

// Import only the pure pieces that don't touch the Supabase server client at
// import time (the action functions are only reached inside try/catch here).
import { IntentSchema } from "./gemini";

describe("IntentSchema (zod)", () => {
  it("accepts a well-formed depletion intent", () => {
    const parsed = IntentSchema.parse({
      action: "deplete",
      item: "Paracetamol",
      quantity: 0,
      confidence: "high",
    });
    expect(parsed.action).toBe("deplete");
    expect(parsed.item).toBe("Paracetamol");
  });

  it("accepts a query with a facility", () => {
    const parsed = IntentSchema.parse({
      action: "lookup",
      item: "Paracetamol",
      facility: "Rampur PHC",
      quantity: 0,
      confidence: "high",
    });
    expect(parsed.facility).toBe("Rampur PHC");
  });

  it("rejects an unknown action", () => {
    expect(() =>
      IntentSchema.parse({ action: "explode", item: "X", quantity: 0, confidence: "high" })
    ).toThrow();
  });

  it("rejects a non-integer / negative quantity", () => {
    expect(() =>
      IntentSchema.parse({ action: "restock", item: "ORS", quantity: 2.5, confidence: "high" })
    ).toThrow();
    expect(() =>
      IntentSchema.parse({ action: "restock", item: "ORS", quantity: -1, confidence: "high" })
    ).toThrow();
  });

  it("rejects a blank item name", () => {
    expect(() =>
      IntentSchema.parse({ action: "deplete", item: "", quantity: 0, confidence: "high" })
    ).toThrow();
  });

  it("rejects a missing confidence", () => {
    expect(() =>
      IntentSchema.parse({ action: "deplete", item: "ORS", quantity: 0 })
    ).toThrow();
  });
});

// parseIntent cooperates with the schema: a chain that returns invalid JSON
// must surface null (so the caller surfaces a confirmation, never writes).
// Importing parseIntent is safe; it only constructs the prompt and calls a
// helper that hits fetch — which we stub.
import { parseIntent } from "./gemini";

const originalFetch = global.fetch;

describe("parseIntent", () => {
  beforeEach(() => {
    // No API key set during tests — exercise the no-key fast path.
    delete process.env.OPENROUTER_API_KEY;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = "";
  });

  it("returns null gracefully when OPENROUTER_API_KEY is unset (ADR-005 isolation)", async () => {
    const res = await parseIntent("Paracetamol khatam");
    expect(res).toBeNull();
  });

  it("returns null when the provider yields invalid JSON", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "not json at all" } }],
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
    const res = await parseIntent("foobar");
    expect(res).toBeNull();
  });

  it("parses a well-formed JSON payload through the zod schema", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  action: "deplete",
                  item: "Paracetamol",
                  quantity: 0,
                  confidence: "high",
                }),
              },
            },
          ],
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
    const res = await parseIntent("Paracetamol khatam");
    expect(res?.action).toBe("deplete");
    expect(res?.item).toBe("Paracetamol");
    expect(res?.confidence).toBe("high");
  });
});
