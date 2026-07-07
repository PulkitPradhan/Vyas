"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="py-24 bg-ms-bg">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[450px] w-full rounded-ms-2xl bg-brand-tint/50 overflow-hidden flex items-center justify-center border border-brand-light/30"
          >
            {/* Abstract Decorative Elements for Illustration */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #0F6E5C 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="w-64 h-64 bg-white rounded-full shadow-brand flex items-center justify-center p-8 z-10"
            >
              <div className="w-full h-full rounded-full border-4 border-brand/10 border-t-brand animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute w-40 h-40 rounded-full bg-brand-light/20 flex items-center justify-center">
                 <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16 text-brand" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M12 12v4M12 8v2M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                 </svg>
              </div>
            </motion.div>

            <motion.div
              animate={{ x: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute bottom-10 left-10 bg-white px-4 py-2 rounded-lg shadow-card border border-ms-border flex items-center gap-2 z-20"
            >
               <div className="w-3 h-3 rounded-full bg-watch animate-pulse" />
               <span className="text-sm font-semibold text-ms-textPrimary">System Online</span>
            </motion.div>

          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight mb-6">
              What is Vayas?
            </h2>
            <div className="space-y-6 text-lg text-ms-textSecondary leading-relaxed mb-8">
              <p>
                Vayas is an AI-powered district healthcare operations platform built to help Primary Health Centres (PHCs) and Community Health Centres (CHCs) stay one step ahead of operational challenges.
              </p>
              <p>
                By providing real-time visibility into medicine stock, bed availability, doctor attendance, and medical equipment status, Vayas enables healthcare workers and district administrators to make faster, better-informed decisions before shortages impact patient care.
              </p>
              <p>
                Designed with an offline-first approach, Vayas works reliably even in areas with poor internet connectivity, ensuring that critical healthcare information remains accessible whenever it's needed.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand-tint text-brand font-bold text-base transition-all duration-300 hover:bg-brand hover:text-white"
            >
              Learn More
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
