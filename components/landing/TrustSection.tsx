"use client";

import { motion } from "framer-motion";
import { WifiOff, Brain, Clock, Languages } from "lucide-react";

const TRUST_CARDS = [
  {
    icon: WifiOff,
    title: "Offline First",
    description: "Works even with poor internet connectivity.",
    color: "brand",
  },
  {
    icon: Brain,
    title: "AI Powered",
    description: "Turns healthcare data into meaningful insights.",
    color: "watch",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Live visibility into district healthcare resources.",
    color: "warning",
  },
  {
    icon: Languages,
    title: "Bilingual",
    description: "Designed for both English and Hindi.",
    color: "brand",
  },
];

export default function TrustSection() {
  return (
    <section className="relative -mt-10 pb-20 z-20">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_CARDS.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-ms-surface p-6 rounded-ms-xl shadow-card border border-ms-border transition-all duration-300 hover:shadow-lg flex flex-col items-start gap-4"
            >
              <div
                className={`w-12 h-12 rounded-ms-md flex items-center justify-center shrink-0 ${
                  card.color === "brand"
                    ? "bg-brand-tint text-brand"
                    : card.color === "watch"
                    ? "bg-watch-tint text-watch"
                    : "bg-warning-tint text-warning"
                }`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ms-textPrimary mb-2">{card.title}</h3>
                <p className="text-sm text-ms-textSecondary leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
