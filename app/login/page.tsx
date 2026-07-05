import LoginClient from "./login-client";

// Force dynamic so the route isn't statically prerendered against an env-less
// build sandbox — the Supabase client is constructed lazily in the browser.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginClient />;
}
