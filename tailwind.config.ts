import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./domain/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Severity — functional use only */
        critical: "#D64545",
        warning:  "#C98A1F",
        watch:    "#2E8B57",

        /* Brand teal */
        brand: {
          DEFAULT: "#0F6E5C",
          hover:   "#0A5548",
          tint:    "#E3F3EF",
          light:   "#B6E2D9",
        },

        /* Surface system */
        ms: {
          bg:        "#FAFAF8",
          surface:   "#FFFFFF",
          surface2:  "#F3F4F6",
          border:    "#E4E7EB",
          textPrimary:   "#14181C",
          textSecondary: "#5B6470",
          textDisabled:  "#9CA3AF",
        },

        /* Severity tints */
        "critical-tint": "#FBEAEA",
        "warning-tint":  "#FBF2E1",
        "watch-tint":    "#E9F5EE",
      },

      fontFamily: {
        sans:  ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "Inter", "sans-serif"],
      },

      fontSize: {
        /* Field/Patient app scale */
        micro:   ["14px", { lineHeight: "1.4" }],
        body:    ["16px", { lineHeight: "1.5" }],
        section: ["20px", { lineHeight: "1.3" }],
        hero:    ["28px", { lineHeight: "1.2", fontWeight: "700" }],

        /* Admin dashboard scale */
        "admin-xs":  ["13px", { lineHeight: "1.4" }],
        "admin-sm":  ["15px", { lineHeight: "1.5" }],
        "admin-md":  ["18px", { lineHeight: "1.4" }],
        "admin-lg":  ["24px", { lineHeight: "1.3" }],
        "admin-xl":  ["32px", { lineHeight: "1.2" }],
      },

      borderRadius: {
        "ms-sm":  "10px",
        "ms-md":  "16px",
        "ms-lg":  "20px",
        "ms-xl":  "28px",
        "ms-2xl": "32px",
      },

      boxShadow: {
        card:     "0 2px 8px rgba(0,0,0,0.06)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.10)",
        brand:    "0 4px 20px rgba(15, 110, 92, 0.20)",
        critical: "0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(214, 69, 69, 0.18)",
        warning:  "0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(201, 138, 31, 0.18)",
        "watch-shadow":   "0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(46, 139, 87, 0.18)",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        ms:     "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      animation: {
        "press":           "ms-press 100ms cubic-bezier(0.34,1.56,0.64,1)",
        "fade-rise":       "ms-fade-rise 150ms cubic-bezier(0.4,0,0.2,1) both",
        "slide-in":        "ms-slide-in 280ms cubic-bezier(0.34,1.56,0.64,1) both",
        "highlight-pulse": "ms-highlight-pulse 1000ms cubic-bezier(0.4,0,0.2,1) both",
        "pulse-ring":      "ms-pulse-ring 600ms cubic-bezier(0.4,0,0.2,1) infinite",
        "story-reveal":    "ms-story-reveal 500ms cubic-bezier(0.4,0,0.2,1) both",
        "xfade":           "ms-xfade 150ms cubic-bezier(0.4,0,0.2,1)",
        "count-up":        "ms-count-up 400ms cubic-bezier(0.4,0,0.2,1) both",
      },

      keyframes: {
        "ms-press": {
          "0%,100%": { transform: "scale(1)" },
          "50%":     { transform: "scale(0.97)" },
        },
        "ms-fade-rise": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "ms-slide-in": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "ms-highlight-pulse": {
          "0%":   { backgroundColor: "var(--ms-brand-tint)" },
          "100%": { backgroundColor: "transparent" },
        },
        "ms-pulse-ring": {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "ms-story-reveal": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "ms-xfade": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "ms-count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },

      spacing: {
        "tap": "48px",
        "tap-sm": "44px",
        "tap-admin": "40px",
      },

      maxWidth: {
        "field":    "480px",
        "patient":  "720px",
        "admin":    "1400px",
        "content":  "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
