"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import LangToggle from "@/components/LangToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

let supabaseSingleton: SupabaseClient | null = null;
const getClient = () => {
  if (!supabaseSingleton) supabaseSingleton = createBrowserSupabase();
  return supabaseSingleton;
};

type Step = "choose" | "phone" | "email" | "otp" | "verifying" | "not_registered";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  // Whether `message` represents an error (vs. an informational note like
  // "code sent"). The error banner keys off this so an email-flow error never
  // renders under the phone form (they no longer share a generic "error" step).
  const [errored, setErrored] = useState(false);
  const [busy, setBusy] = useState(false);

  const normalizePhone = (raw: string) => {
    const trimmed = raw.trim();
    // Respect an explicit international number the user already typed.
    if (trimmed.startsWith("+")) return `+${trimmed.replace(/\D/g, "")}`;
    const digits = trimmed.replace(/\D/g, "");
    // Bare 10-digit input => Indian mobile (the login form is India-scoped).
    if (digits.length === 10) return `+91${digits}`;
    // 12 digits starting with the Indian country code.
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    // Otherwise assume the user included their own country code.
    return `+${digits}`;
  };

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setErrored(false);
    const { error } = await getClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setBusy(false);
      setErrored(true);
      setMessage(error.message);
      return; // stay on the email form
    }
    const res = await fetch("/api/login-resolve", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      router.replace(data.redirectTo);
      router.refresh();
      return;
    }
    if (data.reason === "not_registered") {
      setStep("not_registered");
      return;
    }
    setErrored(true);
    setMessage(t.resolve_error);
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrored(false);
    const fullPhone = normalizePhone(phone);
    if (fullPhone.replace(/\D/g, "").length < 12) {
      setStep("phone");
      setErrored(true);
      setMessage(t.invalid_phone);
      return;
    }
    setBusy(true);
    setStep("verifying");
    const { error } = await getClient().auth.signInWithOtp({ phone: fullPhone });
    setBusy(false);
    if (error) {
      setStep("phone");
      setErrored(true);
      setMessage(error.message);
      return;
    }
    setStep("otp");
    setMessage(`${t.code_sent_to} ${fullPhone}.`);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrored(false);
    setBusy(true);
    setStep("verifying");
    const { error } = await getClient().auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: "sms",
    });
    if (error) {
      setBusy(false);
      setStep("otp");
      setErrored(true);
      setMessage(error.message);
      return;
    }
    const res = await fetch("/api/login-resolve", { method: "POST" });
    const data = (await res.json()) as
      | { ok: true; redirectTo: string; name: string }
      | { ok: false; reason: "not_registered" | "unknown" };
    setBusy(false);
    if (data.ok) {
      router.replace(data.redirectTo);
      router.refresh();
      return;
    }
    if (data.reason === "not_registered") {
      setStep("not_registered");
      return;
    }
    setStep("otp");
    setErrored(true);
    setMessage(t.resolve_error);
  }

  const inputBase =
    "w-full rounded-ms-sm border border-ms-border bg-ms-surface px-4 py-3 text-ms-textPrimary " +
    "placeholder:text-ms-textDisabled transition-colors " +
    "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-ms-bg px-4 py-12 relative">
      <div className="absolute top-4 right-4"><LangToggle /></div>
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-ms-md bg-brand shadow-brand">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 12v4M12 8v2M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-ms-textPrimary">{t.login_title}</h1>
          <p className="mt-1 text-sm text-ms-textSecondary">
            {t.login_subtitle}
          </p>
        </div>

        <div className="rounded-ms-md border border-ms-border bg-ms-surface p-6 shadow-card-lg">
          {errored && message && (
            <div className="mb-4 flex items-start gap-2 rounded-ms-sm border border-[#EDB3B3] bg-critical-tint px-4 py-3 text-sm text-critical ms-xfade">
              <svg viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm7.25-3.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
              </svg>
              {message}
            </div>
          )}

          {step === "choose" && (
            <div className="space-y-3">
              <button
                id="email-signin-btn"
                type="button"
                onClick={() => setStep("email")}
                className="
                  ms-press w-full flex items-center justify-center gap-3 rounded-ms-sm
                  border border-ms-border bg-ms-surface px-4 py-3.5 text-sm font-semibold
                  text-ms-textPrimary shadow-card transition-all hover:border-ms-textSecondary hover:shadow-card-lg
                "
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-ms-textSecondary" aria-hidden="true">
                  <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm14 2.2V6l-7 4.2L3 6v.2l7 4.2 7-4.2z" />
                </svg>
                {t.continue_email}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ms-border" />
                <span className="text-xs text-ms-textDisabled">{t.or}</span>
                <div className="flex-1 h-px bg-ms-border" />
              </div>

              <button
                id="phone-signin-btn"
                type="button"
                onClick={() => setStep("phone")}
                className="
                  ms-press w-full flex items-center justify-center gap-3 rounded-ms-sm
                  bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-brand
                  transition-all hover:bg-brand-hover active:scale-95
                "
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd"/>
                </svg>
                {t.continue_phone}
              </button>

              <p className="text-center text-xs text-ms-textDisabled pt-1">
                {t.admin_provision_note}
              </p>
            </div>
          )}

          {(step === "email") && (
            <form onSubmit={signInWithEmail} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
                  {t.email}
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="staff@district.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="password-input" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
                  {t.password}
                </label>
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputBase}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={busy || !email || !password}
                className="
                  ms-press w-full rounded-ms-sm bg-brand px-4 py-3.5 text-base font-semibold
                  text-white shadow-brand transition-all hover:bg-brand-hover
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {busy ? <span className="flex items-center justify-center gap-2"><Spinner /> {t.signing_in}</span> : t.sign_in}
              </button>
              <button
                type="button"
                onClick={() => { setStep("choose"); setErrored(false); setMessage(null); }}
                className="w-full text-sm text-ms-textSecondary hover:text-ms-textPrimary"
              >
                ← {t.back}
              </button>
            </form>
          )}

          {step === "phone" && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone-input" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
                  {t.phone_number}
                </label>
                <input
                  id="phone-input"
                  inputMode="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputBase}
                  autoFocus
                  required
                />
                <p className="mt-1 text-xs text-ms-textSecondary">{t.indian_number_note}</p>
              </div>
              <button
                type="submit"
                disabled={busy || phone.replace(/\D/g, "").length < 10}
                className="
                  ms-press w-full rounded-ms-sm bg-brand px-4 py-3.5 text-base font-semibold
                  text-white shadow-brand transition-all hover:bg-brand-hover
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {busy ? <span className="flex items-center justify-center gap-2"><Spinner /> {t.sending}</span> : t.send_code}
              </button>
              <button
                type="button"
                onClick={() => { setStep("choose"); setErrored(false); setMessage(null); }}
                className="w-full text-sm text-ms-textSecondary hover:text-ms-textPrimary"
              >
                ← {t.back}
              </button>
            </form>
          )}

          {(step === "otp" || step === "verifying") && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="rounded-ms-sm border border-brand-light bg-brand-tint px-4 py-3 text-sm text-brand ms-xfade">
                {t.code_sent_to} {normalizePhone(phone)}
              </div>
              <div>
                <label htmlFor="otp-input" className="mb-1.5 block text-sm font-medium text-ms-textPrimary">
                  {t.six_digit_otp}
                </label>
                <input
                  id="otp-input"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="· · · · · ·"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`text-center text-3xl font-bold tracking-[0.6em] ${inputBase}`}
                  autoFocus
                />
              </div>
              {message && (
                <p className="text-xs text-ms-textSecondary">{message}</p>
              )}
              <button
                type="submit"
                disabled={busy || otp.length !== 6}
                className="
                  ms-press w-full rounded-ms-sm bg-brand px-4 py-3.5 text-base font-semibold
                  text-white shadow-brand transition-all hover:bg-brand-hover
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {busy ? <span className="flex items-center justify-center gap-2"><Spinner /> {t.verifying}</span> : t.verify_code}
              </button>
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setMessage(null); setErrored(false); }}
                className="w-full text-sm text-ms-textSecondary hover:text-ms-textPrimary"
              >
                {t.use_different_number}
              </button>
            </form>
          )}

          {step === "not_registered" && (
            <div className="space-y-4 text-center ms-xfade">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-tint text-warning">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-semibold text-ms-textPrimary">{t.not_registered}</p>
              <p className="text-sm text-ms-textSecondary">
                {t.not_registered_desc}
              </p>
              <button
                type="button"
                onClick={() => { setStep("choose"); setOtp(""); setMessage(null); setErrored(false); }}
                className="w-full rounded-ms-sm border border-ms-border px-4 py-3 text-sm font-medium hover:bg-ms-bg"
              >
                {t.try_different_method}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ms-textSecondary">
          {t.looking_for_medicine}{" "}
          <Link href="/public" className="font-medium text-brand underline-offset-2 hover:underline">
            {t.open_public_lookup}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Spinner({ className = "text-white" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 animate-spin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}
