import React from 'react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative pt-28 sm:pt-36 md:pt-44 pb-20 sm:pb-28 overflow-visible">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-xl lg:max-w-[500px]">
          {/* Main Title: Warm Golden Serif Wordmark */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal text-[#A37834] dark:text-[#D4AF37] tracking-[-0.015em] leading-[1.04]"
          >
            Lucky Dangle
          </motion.h1>

          {/* Italicized Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-editorial italic text-xl sm:text-2xl md:text-[26px] text-[#6B7280] dark:text-[#9CA3AF] font-normal mt-1.5 mb-6"
          >
            A lucky charm for your screen.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-[15px] sm:text-[16px] text-[#4B5563] dark:text-[#94A3B8] leading-[1.65] font-normal mb-8 max-w-[460px]"
          >
            Choose a charm and hang it from the top of your screen, on Mac or Windows. It sways while you work, stays out of every click, and drops in when you call it.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-wrap items-center gap-3.5"
          >
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-6 py-3 rounded-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium transition-all shadow-xs active:scale-98"
            >
              Get Lucky Dangle
            </button>
            <button
              onClick={() => scrollToSection('charms')}
              className="px-6 py-3 rounded-full border border-[#E5E7EB] dark:border-[#334155] bg-card text-[#1F2937] dark:text-[#F1F5F9] text-[14px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-98 shadow-xs"
            >
              Meet the charms
            </button>
          </motion.div>

          {/* Hint text below buttons */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="text-[12.5px] text-[#9CA3AF] dark:text-[#64748B] mt-7 font-normal"
          >
            Try the charm: grab it and give it a flick.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
