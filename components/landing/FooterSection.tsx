"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-ms-surface border-t border-ms-border pt-16 pb-8">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-ms-sm bg-brand text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M12 12v4M12 8v2M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-ms-textPrimary">
                Vayas
              </span>
            </div>
            <p className="text-sm text-ms-textSecondary leading-relaxed pr-4">
              Empowering district healthcare systems with real-time operational intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-ms-textPrimary mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">Home</Link></li>
              <li><Link href="/#about" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">About Vayas</Link></li>
              <li><Link href="/#support" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">Help & Support</Link></li>
              <li><Link href="/#contact" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-ms-textPrimary mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/#support" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">FAQs</Link></li>
              <li><Link href="/privacy" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-ms-textSecondary hover:text-brand transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-ms-textPrimary mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:work.vayas@gmail.com" className="flex items-center gap-2 text-sm text-ms-textSecondary hover:text-brand transition-colors">
                  <Mail className="w-4 h-4" />
                  work.vayas@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ms-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ms-textDisabled">
            &copy; 2026 Vayas. All rights reserved.
          </p>
          <p className="text-sm font-medium text-brand">
            Built for better public healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
}
