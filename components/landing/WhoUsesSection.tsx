"use client";

import { motion } from "framer-motion";
import { UserPlus, Pill, Stethoscope, Users, Building2 } from "lucide-react";

const USERS = [
  {
    icon: UserPlus,
    title: "ANM / Nurse",
    items: ["Quick patient counting", "Bed availability updates", "Simple one-tap reporting"],
  },
  {
    icon: Pill,
    title: "Pharmacist",
    items: ["Update medicine stock", "Voice-assisted stock entry", "Early stock-out alerts"],
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    items: ["Quick attendance check-in", "Location verification", "Daily availability"],
  },
  {
    icon: Users,
    title: "Patients",
    items: ["No login required", "Search nearby healthcare availability", "Find available medicines, doctors and beds"],
  },
  {
    icon: Building2,
    title: "District Administrator",
    items: ["Live operational dashboard", "AI-generated insights", "Resource redistribution recommendations"],
  },
];

export default function WhoUsesSection() {
  return (
    <section className="py-24 bg-ms-surface border-y border-ms-border relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-tint/30 to-transparent pointer-events-none" />

      <div className="max-w-content mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight"
          >
            Who Uses Vayas?
          </motion.h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {USERS.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white/60 backdrop-blur-xl border border-white/60 shadow-card rounded-2xl p-8 hover:shadow-brand transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-brand-tint flex items-center justify-center text-brand mb-6 shadow-sm border border-brand-light/50">
                <user.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-ms-textPrimary mb-4">{user.title}</h3>
              <ul className="space-y-3">
                {user.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ms-textSecondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
