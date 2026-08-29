import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PricingSection: React.FC = () => {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);

  const handlePurchase = (planName: string) => {
    setPurchasedPlan(planName);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setPurchasedPlan(null), 3000);
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 relative">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-text-primary tracking-[-0.02em] leading-tight mb-3">
            Lucky pricing
          </h2>
          <p className="text-base sm:text-lg text-text-secondary font-normal mb-2">
            You pay once and it’s yours forever.
          </p>
          <p className="text-xs sm:text-sm font-medium text-accent tracking-wide">
            A little extra luck, for a limited time.
          </p>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[840px] mb-12">
          {/* Card 1: Lucky */}
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-9 flex flex-col justify-between hover:border-border-strong shadow-subtle hover:shadow-card-hover transition-all duration-300">
            <div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-text-primary mb-4">
                Lucky
              </h3>
              
              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-sm sm:text-base text-text-muted line-through">
                  ₹777
                </span>
                <span className="font-editorial text-4xl sm:text-5xl font-normal text-text-primary">
                  ₹201
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>All charms, plus any emoji you want to hang</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Every future charm and update</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>No subscription, no account, no license keys</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div>
              <button
                onClick={() => handlePurchase('Lucky')}
                className="w-full py-2.5 px-6 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-98 transition-all shadow-xs"
              >
                {purchasedPlan === 'Lucky' ? '✨ Blessed & Downloading...' : 'Get Lucky Dangle'}
              </button>
            </div>
          </div>

          {/* Card 2: Extra Lucky */}
          <div className="bg-card border-2 border-accent/70 relative rounded-2xl p-8 sm:p-9 flex flex-col justify-between shadow-card-selected hover:shadow-card-hover transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-text-primary">
                  Extra Lucky
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                  Popular
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-sm sm:text-base text-text-muted line-through">
                  ₹1,111
                </span>
                <span className="font-editorial text-4xl sm:text-5xl font-normal text-text-primary">
                  ₹501
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-text-primary">Everything in Lucky</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Your charm suggestion goes to the front of the queue</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>A little extra support for the person making it</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Measurably more luck*</span>
                </li>
              </ul>
            </div>

            {/* CTA & Disclaimer */}
            <div>
              <button
                onClick={() => handlePurchase('Extra Lucky')}
                className="w-full py-2.5 px-6 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-98 transition-all shadow-xs mb-3"
              >
                {purchasedPlan === 'Extra Lucky' ? '✨ Blessed & Downloading...' : 'Be Extra Lucky'}
              </button>
              <p className="text-[11px] text-text-muted text-center italic">
                *not measurable
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Footnotes */}
        <div className="max-w-2xl space-y-3 text-xs sm:text-[13px] text-text-secondary leading-relaxed">
          <p className="font-medium text-text-primary">
            UPI available at checkout.
          </p>
          <p>
            One purchase covers both platforms. On Mac, a direct download for Intel and Apple silicon running macOS 14 or later, notarized by Apple. On Windows, a signed installer for Windows 10 and 11.
          </p>
          <div className="pt-2">
            <span className="text-text-secondary">Looking for a discount? </span>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="text-accent font-medium hover:underline"
            >
              There is a way.
            </button>
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      <AnimatePresence>
        {showDiscountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowDiscountModal(false)}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-editorial text-2xl text-text-primary mb-3">
                Student, educator, or in a tight spot?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                If you're a student, researcher, educator, or simply unable to afford the purchase price right now, send an email to <a href="mailto:luckydangle@karthik.com" className="text-accent underline font-medium">luckydangle@karthik.com</a>. We believe everyone deserves a little luck on their screen.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
