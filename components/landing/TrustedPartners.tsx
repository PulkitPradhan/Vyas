"use client";

import Image from "next/image";

const partners = [
  { name: "Asian Institute of Medical Sciences", logo: "/logos/asian.png" },
  { name: "Sarvodaya Hospital", logo: "/logos/sarvodaya.png" },
  { name: "Accord Superspeciality Hospital", logo: "/logos/accord.png" },
  { name: "Amrita Hospital", logo: "/logos/amrita.png" },
  { name: "Yatharth Super Speciality Hospital", logo: "/logos/yatharth.png" },
  { name: "Metro Heart Institute", logo: "/logos/metro.png" },
];

export default function TrustedPartners() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes infinite-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-marquee {
          animation: infinite-marquee 40s linear infinite;
          will-change: transform;
        }
        @media (max-width: 1024px) {
          .animate-infinite-marquee {
            animation-duration: 30s;
          }
        }
        @media (max-width: 640px) {
          .animate-infinite-marquee {
            animation-duration: 25s;
          }
        }
        .pause-on-hover:hover .animate-infinite-marquee {
          animation-play-state: paused;
        }
      `}} />
      
      {/* Subtle Background Radial Gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[800px] rounded-full bg-brand opacity-[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-ms-textPrimary tracking-tight mb-5">
          Trusted Healthcare Partners
        </h2>
        <p className="text-lg sm:text-xl text-ms-textSecondary max-w-2xl mx-auto">
          Connecting citizens with trusted healthcare providers across Faridabad.
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="pause-on-hover relative z-10 flex overflow-hidden">
        {/* Transparent gradient masks for smooth fade at edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
        
        {/* We use two identical arrays to create the seamless loop. They sit side-by-side. 
            When the container translates -50%, it seamlessly resets. */}
        <div className="flex w-max min-w-full animate-infinite-marquee items-center pl-4 sm:pl-8">
          {[...partners, ...partners].map((partner, i) => (
            <div key={`${partner.name}-${i}`} className="shrink-0 pr-8">
              <div className="group relative flex h-[110px] w-[220px] sm:h-[120px] sm:w-[240px] items-center justify-center rounded-2xl border border-ms-border/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-[6px] hover:shadow-card-lg">
                <div className="relative h-full w-full p-5 sm:p-7 flex items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} Logo`}
                    fill
                    className="object-contain p-5 sm:p-6 opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                    sizes="(max-width: 640px) 220px, 240px"
                    loading="lazy"
                    aria-label={partner.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
