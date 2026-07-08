"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronDown, Wrench, Mail, Clock } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SupportSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQS = [
    {
      question: t.faq_1_q,
      answer: t.faq_1_a,
    },
    {
      question: t.faq_2_q,
      answer: t.faq_2_a,
    },
    {
      question: t.faq_3_q,
      answer: t.faq_3_a,
    },
    {
      question: t.faq_4_q,
      answer: t.faq_4_a,
    },
    {
      question: t.faq_5_q,
      answer: t.faq_5_a,
    },
    {
      question: t.faq_6_q,
      answer: t.faq_6_a,
    },
    {
      question: t.faq_7_q,
      answer: t.faq_7_a,
    },
    {
      question: t.faq_8_q,
      answer: t.faq_8_a,
    },
    {
      question: t.faq_9_q,
      answer: t.faq_9_a,
    },
    {
      question: t.faq_10_q,
      answer: t.faq_10_a,
    },
  ];

  const SUPPORT_CARDS = [
    {
      icon: Wrench,
      title: t.support_card_1_title,
      description: t.support_card_1_desc,
    },
    {
      icon: Mail,
      title: t.support_card_2_title,
      description: "work.vayas@gmail.com",
    },
    {
      icon: Clock,
      title: t.support_card_3_title,
      description: t.support_card_3_desc,
    },
  ];

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-ms-bg relative" id="support">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <m.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-ms-textPrimary tracking-tight mb-4"
          >
            {t.support_title}
          </m.h2>
          <p className="text-lg text-ms-textSecondary">
            {t.support_desc}
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-20 space-y-4">
          <h3 className="text-xl font-bold text-ms-textPrimary mb-6">{t.faq_title}</h3>
          {FAQS.map((faq, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-ms-surface rounded-ms-lg border border-ms-border overflow-hidden transition-colors hover:border-brand-light"
            >
              <button
                type="button"
                onClick={() => toggleOpen(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="font-semibold text-ms-textPrimary pr-8">{faq.question}</span>
                <m.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="shrink-0 text-brand"
                >
                  <ChevronDown className="w-5 h-5" />
                </m.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <m.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-5 pt-0 text-ms-textSecondary text-sm leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          ))}
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPORT_CARDS.map((card, index) => (
            <m.div
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
            </m.div>
          ))}
        </div>

      </div>
    </section>
  );
}

