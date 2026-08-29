import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const links = [
    { label: 'Email', href: 'mailto:luckydangle@karthik.com', external: true },
    {
      label: 'Discount',
      action: () =>
        setModalContent({
          title: 'Discounts & Parity',
          body: 'We offer student, educator, and regional purchasing power parity discounts. Reach out at luckydangle@karthik.com to get your personal code.',
        }),
    },
    {
      label: 'Privacy',
      action: () =>
        setModalContent({
          title: 'Privacy Policy',
          body: 'Lucky Dangle collects zero telemetry, zero analytics, and zero personal data. It lives locally on your screen and respects your machine completely.',
        }),
    },
    {
      label: 'Terms',
      action: () =>
        setModalContent({
          title: 'Terms of Use',
          body: 'Pay once, yours forever. Free updates for all existing and upcoming charms. No accounts or periodic license checks.',
        }),
    },
    {
      label: 'Press',
      action: () =>
        setModalContent({
          title: 'Press & Media Kit',
          body: 'High-res screenshots, charm icons, and founder note available upon request at press@luckydangle.com.',
        }),
    },
    {
      label: 'Updates',
      action: () =>
        setModalContent({
          title: 'Release Notes',
          body: 'Version 1.2 introduces the Scarab and Himmeli traditions, along with customizable emoji dangling support and smooth Apple Silicon native builds.',
        }),
    },
    {
      label: 'Elsewhere',
      href: '#',
      action: () => {
        const el = document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <footer className="pt-16 pb-20 border-t border-border bg-background">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Creator Note */}
          <div className="text-sm text-text-secondary">
            <p className="leading-relaxed">
              Crafted with care and curiosity by{' '}
              <span className="font-medium text-text-primary">Karthik Mahadevan</span>
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-secondary">
            {links.map((link, idx) =>
              link.external ? (
                <a
                  key={idx}
                  href={link.href}
                  className="hover:text-text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={idx}
                  onClick={link.action}
                  className="hover:text-text-primary transition-colors bg-transparent p-0"
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          {/* Theme Controls */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setModalContent(null)}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-editorial text-2xl text-text-primary mb-3">
                {modalContent.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {modalContent.body}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setModalContent(null)}
                  className="px-5 py-2 rounded-full bg-accent text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
