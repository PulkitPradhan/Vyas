"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wrench, Mail, Clock } from "lucide-react";

const FAQS = [
  {
    question: "How can I check if a medicine is available at a nearby PHC or CHC?",
    answer: "Use the \"Check Service Availability\" option on the homepage. No login is required.",
  },
  {
    question: "Do I need to create an account to check healthcare services?",
    answer: "No. Citizens can search for available medicines, beds, doctors, and healthcare facilities without creating an account.",
  },
  {
    question: "Who can sign in to Vayas?",
    answer: "Authorized healthcare staff such as Doctors, ANMs, Nurses, Pharmacists, and District Administrators can securely sign in to manage healthcare resources.",
  },
  {
    question: "Does Vayas work without internet?",
    answer: "Yes. Vayas is designed with an offline-first architecture. Healthcare staff can continue working even with poor or unstable network connectivity, and data syncs automatically when the connection is restored.",
  },
  {
    question: "Which languages does Vayas support?",
    answer: "Currently, Vayas supports both English and Hindi to ensure accessibility for healthcare workers and citizens.",
  },
  {
    question: "How often is healthcare information updated?",
    answer: "Medicine availability, doctor attendance, bed status, and equipment updates are reflected in real time whenever new information is submitted.",
  },
  {
    question: "What should I do if I find incorrect information?",
    answer: "Please report the issue through the Contact Us page or email our support team. Our administrators will verify and update the information promptly.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes. Vayas follows secure authentication and modern data protection practices to keep user information safe.",
  },
  {
    question: "How can healthcare staff update medicine stock or bed availability?",
    answer: "After signing in, authorized staff can update medicine inventory, bed occupancy, doctor attendance, and equipment status through a simple dashboard.",
  },
  {
    question: "How can I contact the Vayas support team?",
    answer: "You can reach us anytime at:\n📧 work.vayas@gmail.com",
  },
];

const SUPPORT_CARDS = [
  {
    icon: Wrench,
    title: "Technical Support",
    description: "Get help with login issues, platform access, or technical problems.",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "work.vayas@gmail.com",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "Typically within 24 hours during business days.",
  },
];

export default function SupportSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-ms-bg relative" id="support">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight mb-4"
          >
            Help & Support
          </motion.h2>
          <p className="text-lg text-ms-textSecondary">
            Find answers to common questions or contact our support team for assistance.
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-20 space-y-4">
          <h3 className="text-xl font-bold text-ms-textPrimary mb-6">Frequently Asked Questions</h3>
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-ms-surface rounded-ms-lg border border-ms-border overflow-hidden transition-colors hover:border-brand-light"
            >
              <button
                onClick={() => toggleOpen(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="font-semibold text-ms-textPrimary pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="shrink-0 text-brand"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-5 pt-0 text-ms-textSecondary text-sm leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPORT_CARDS.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-ms-xl p-6 shadow-card border border-ms-border text-center flex flex-col items-center hover:shadow-brand transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-brand-tint text-brand flex items-center justify-center mb-4">
                <card.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-ms-textPrimary mb-2">{card.title}</h4>
              <p className="text-sm text-ms-textSecondary leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
