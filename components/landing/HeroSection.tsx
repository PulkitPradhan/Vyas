"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, ShieldCheck, MapPin, Database } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-ms-bg/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-light/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-tint/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-content mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-tint border border-brand-light/50 text-brand text-sm font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            Offline-first • AI-powered • Real-time
          </div>

          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-ms-textPrimary leading-[1.1] tracking-tight mb-6">
            District Healthcare, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#0A5548]">
              Made Smarter.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-ms-textSecondary leading-relaxed mb-10 max-w-xl">
            Vayas helps Primary Health Centres and Community Health Centres identify medicine shortages, unavailable beds, doctor absences, and equipment issues <strong className="text-ms-textPrimary font-semibold">before patients are turned away.</strong>
            <br className="hidden sm:block" />
            <br className="hidden sm:block" />
            Built for low-connectivity environments and accessible on any smartphone.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-brand text-white font-bold text-base transition-all duration-300 hover:bg-brand-hover hover:shadow-[0_8px_30px_rgba(15,110,92,0.3)] active:scale-95"
            >
              Staff Sign In
            </Link>
            <Link
              href="/public"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-ms-surface border border-ms-border text-ms-textPrimary font-bold text-base shadow-sm transition-all duration-300 hover:border-brand-light hover:text-brand hover:shadow-brand active:scale-95 bg-white/80 backdrop-blur-sm"
            >
              Check Service Availability
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Illustration */}
        <div className="relative h-[500px] hidden lg:block w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Main Center Dashboard Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-ms-surface/90 backdrop-blur-xl border border-white/60 shadow-card-lg rounded-2xl p-6 z-20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center text-brand">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ms-textPrimary">District Overview</p>
                    <p className="text-xs text-ms-textSecondary">Live Status</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-watch-tint text-watch text-xs font-bold rounded-md">Healthy</div>
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-ms-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[85%] rounded-full" />
                </div>
                <div className="h-2 w-full bg-ms-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-watch w-[92%] rounded-full" />
                </div>
                <div className="h-2 w-full bg-ms-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-warning w-[64%] rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Floating Card 1: Medicine */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-[10%] left-[5%] w-[200px] bg-white/90 backdrop-blur-md shadow-card border border-ms-border rounded-xl p-4 z-30"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-ms-textPrimary">Inventory</p>
              </div>
              <p className="text-xs text-ms-textSecondary">Stock updated</p>
              <p className="text-xs font-semibold text-brand mt-1">2 mins ago</p>
            </motion.div>

            {/* Floating Card 2: AI Insights */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[15%] right-[0%] w-[240px] bg-white/90 backdrop-blur-md shadow-card border border-ms-border rounded-xl p-4 z-30"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-watch-tint text-watch flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ms-textPrimary">AI Insight</p>
                  <p className="text-xs text-ms-textSecondary mt-1 leading-relaxed">Sufficient bed capacity projected for the next 48 hours.</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Map/Location */}
            <motion.div
              animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-[60%] left-[-5%] w-[180px] bg-white/90 backdrop-blur-md shadow-card border border-ms-border rounded-xl p-4 z-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning-tint text-warning flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ms-textPrimary">14 PHCs</p>
                  <p className="text-xs text-ms-textSecondary">Online</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
