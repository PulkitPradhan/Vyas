"use client";

import { motion } from "framer-motion";
import { Mail, Clock, MessageCircle, MonitorSmartphone, Send } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-24 bg-ms-surface border-t border-ms-border relative overflow-hidden" id="contact">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-5 hidden lg:block" aria-hidden="true">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </div>

      <div className="max-w-content mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-ms-textSecondary leading-relaxed mb-10 max-w-lg">
              Have questions about Vayas, need technical support, or want to learn how the platform can help your district healthcare services? We&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail, title: "Email", text: "work.vayas@gmail.com", color: "brand" },
                { icon: Clock, title: "Support Hours", text: "Monday – Friday\n9:00 AM – 7:00 PM (IST)", color: "watch" },
                { icon: MessageCircle, title: "Response Time", text: "Usually within 24 hours", color: "warning" },
                { icon: MonitorSmartphone, title: "Platform", text: "Available across mobile, tablet, and desktop.", color: "brand" }
              ].map((info, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-ms-md flex items-center justify-center shrink-0
                    ${info.color === 'brand' ? 'bg-brand-tint text-brand' : 
                      info.color === 'watch' ? 'bg-watch-tint text-watch' : 'bg-warning-tint text-warning'}`}
                  >
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ms-textPrimary mb-1">{info.title}</h4>
                    <p className="text-sm text-ms-textSecondary whitespace-pre-wrap leading-relaxed">{info.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-card-lg rounded-ms-2xl p-8 relative">
              <form className="space-y-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-ms-textPrimary mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className="w-full px-4 py-3 rounded-ms-md border border-ms-border bg-ms-bg focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-ms-textPrimary mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    className="w-full px-4 py-3 rounded-ms-md border border-ms-border bg-ms-bg focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-ms-textPrimary mb-2">Phone Number <span className="text-ms-textDisabled font-normal">(Optional)</span></label>
                  <input 
                    type="tel" 
                    id="phone"
                    className="w-full px-4 py-3 rounded-ms-md border border-ms-border bg-ms-bg focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-ms-textPrimary mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    className="w-full px-4 py-3 rounded-ms-md border border-ms-border bg-ms-bg focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-ms-textPrimary mb-2">Message</label>
                  <textarea 
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-ms-md border border-ms-border bg-ms-bg focus:ring-2 focus:ring-brand/50 focus:border-brand outline-none transition-all resize-none"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-ms-md bg-brand text-white font-bold text-base shadow-brand transition-all duration-300 hover:bg-brand-hover active:scale-[0.98]"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Google Maps Placeholder */}
            <div className="mt-8 h-48 rounded-ms-xl bg-ms-surface2 border border-ms-border flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #9CA3AF 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-ms-border z-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-watch" />
                <span className="text-sm font-semibold text-ms-textSecondary">Office Location Mapping Soon</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
