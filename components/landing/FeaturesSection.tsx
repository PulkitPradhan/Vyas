"use client";

import { motion } from "framer-motion";
import { Pill, Bed, Stethoscope, Wrench, Search, BrainCircuit, Mic, LayoutDashboard } from "lucide-react";

const FEATURES = [
  {
    icon: Pill,
    title: "Medicine Availability Monitoring",
    description: "Monitor medicine inventory before shortages occur.",
  },
  {
    icon: Bed,
    title: "Bed Availability Tracking",
    description: "Know available beds across healthcare centres.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Attendance",
    description: "Track healthcare staff presence.",
  },
  {
    icon: Wrench,
    title: "Equipment Monitoring",
    description: "Identify broken or unavailable medical equipment.",
  },
  {
    icon: Search,
    title: "Patient Availability Search",
    description: "Allow citizens to check nearby healthcare services without login.",
  },
  {
    icon: BrainCircuit,
    title: "AI Insights",
    description: "Generate simple explanations and operational suggestions from healthcare data.",
  },
  {
    icon: Mic,
    title: "Voice & Multilingual Support",
    description: "Support English and Hindi with voice input.",
  },
  {
    icon: LayoutDashboard,
    title: "Real-Time Dashboard",
    description: "Monitor district-wide healthcare resources from one place.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-ms-surface border-t border-ms-border">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight"
          >
            Powerful Features
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-ms-2xl bg-ms-bg border border-ms-border hover:shadow-brand hover:border-brand-light transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-brand-light/40 flex items-center justify-center text-brand shrink-0 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ms-textPrimary mb-2 group-hover:text-brand transition-colors">{feature.title}</h3>
                <p className="text-ms-textSecondary leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
