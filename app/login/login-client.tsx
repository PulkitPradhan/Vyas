"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Build-time prerender has no Supabase env, so defer client construction
// until first user action. Lazy module-level singletons are fine here.
let supabaseSingleton: SupabaseClient | null = null;
const getClient = () => {
  if (!supabaseSingleton) supabaseSingleton = createBrowserSupabase();
  return supabaseSingleton;
};

type Step = "phone" | "otp" | "verifying" | "not_registered" | "error";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return digits.startsWith("91") || digits.length === 10
      ? `+91${digits.replace(/^91/, "")}`
      : `+${digits}`;
  };

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const fullPhone = normalizePhone(phone);
    if (fullPhone.replace(/\D/g, "").length < 12) {
      setStep("error");
      setMessage("Enter a valid 10-digit Indian phone number.");
      return;
    }

    setStep("verifying");
    const { error } = await getClient().auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      setStep("error");
      setMessage(error.message);
      return;
    }
    setStep("otp");
    setMessage(`OTP sent to ${fullPhone}.`);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStep("verifying");

    const { error } = await getClient().auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: "sms",
    });

    if (error) {
      setStep("otp");
      setMessage(error.message);
      return;
    }

    // Successful auth. Resolve the staff row to decide where to go.
    // We POST to /api/login-resolve which uses the server client (cookies)
    // to look up the staff record and return the role, or a not-registered signal.
    const res = await fetch("/api/login-resolve", { method: "POST" });
    const data = (await res.json()) as
      | { ok: true; redirectTo: string; name: string }
      | { ok: false; reason: "not_registered" | "unknown" };

    if (data.ok) {
      router.replace(data.redirectTo);
      router.refresh();
      return;
    }
    if (data.reason === "not_registered") {
      setStep("not_registered");
      return;
    }
    setStep("error");
    setMessage("Could not resolve your staff record. Try again.");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">MediServ</h1>
        <p className="mt-1 text-sm text-gray-500">
          PHC/CHC staff sign-in (phone + OTP)
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        {(step === "phone" || step === "error") && (
          <form onSubmit={sendOtp} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Phone number
              <input
                inputMode="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`mt-1 ${inputClass}`}
                autoFocus
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
            >
              Send OTP
            </button>
          </form>
        )}

        {(step === "otp" || step === "verifying") && (
          <form onSubmit={verifyOtp} className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to {normalizePhone(phone)}.
            </p>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={`text-center text-2xl tracking-[0.5em] ${inputClass}`}
              autoFocus
            />
            <button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white enabled:hover:bg-gray-700 disabled:opacity-40"
            >
              Verify & sign in
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Use a different number
            </button>
          </form>
        )}

        {step === "not_registered" && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-800">
              This number is not registered as MediServ staff.
            </p>
            <p className="text-xs text-gray-500">
              Staff accounts are provisioned by your district admin — not
              self-signup, since MediServ is a closed field-staff tool. Contact
              your admin to be added, then sign in again.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setMessage(null);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Try another number
            </button>
          </div>
        )}

        {message && (
          <p
            className={`mt-3 text-sm ${
              step === "error" ? "text-red-600" : "text-gray-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Patient?{" "}
        <a href="/public" className="underline">
          Check availability — no login needed
        </a>
      </p>
    </main>
  );
}
