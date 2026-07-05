import type { FlagSeverityLike } from "@/lib/types";

// Color-coded severity badge. NEVER color alone — always paired with a text
// label (DESIGN.md Phase 10). Critical=red, Warning=amber, Watch=green.
export default function SeverityBadge({
  severity,
}: {
  severity: FlagSeverityLike;
}) {
  const cfg: Record<
    FlagSeverityLike,
    { bg: string; text: string; label: string }
  > = {
    critical: { bg: "bg-critical/15", text: "text-critical", label: "🔴 Critical" },
    warning: { bg: "bg-amber-100", text: "text-amber-700", label: "🟡 Warning" },
    watch: { bg: "bg-watch/15", text: "text-watch", label: "🟢 Watch" },
  };
  const c = cfg[severity] ?? cfg.watch;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}
      title={c.label}
    >
      {c.label}
    </span>
  );
}
