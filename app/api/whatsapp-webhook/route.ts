import { NextResponse } from "next/server";
import { processMessagePipeline } from "@/lib/ats/pipeline";
import { checkRateLimit } from "@/lib/rate-limit";

// WhatsApp webhook (Twilio incoming)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString() || "";
    const from = formData.get("From")?.toString() || ""; // Format: "whatsapp:+919876543210"
    
    if (!body || !from) {
      return NextResponse.json({ error: "Missing Body or From" }, { status: 400 });
    }

    // Rate Limiting (10 req / minute per phone number)
    const { allowed } = await checkRateLimit({
      ipOrPhone: from,
      maxRequests: 10,
      windowMinutes: 1
    });

    if (!allowed) {
      return new NextResponse(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>Too many requests, please try again in a minute.</Message></Response>",
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Use hashed or truncated phone number as session key to avoid PII in chat_logs
    const sessionKey = from.replace("whatsapp:", "").slice(-4) + "_wa_session";

    const result = await processMessagePipeline(body, "whatsapp", sessionKey);

    // Twilio TwiML response
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${result.response.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Message>
</Response>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });

  } catch (err) {
    console.error("WhatsApp webhook error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
