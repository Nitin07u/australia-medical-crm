import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

export const ElsewhereSection: React.FC = () => {
  const [platform, setPlatform] = useState('Linux');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="py-20 sm:py-28 relative border-t border-border/40">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          {/* Heading */}
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-text-primary tracking-[-0.02em] leading-tight mb-4">
            Not on a Mac or PC?
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal mb-8">
            Lucky Dangle hangs from Mac and Windows screens today. Tell me where you'd like it next — Linux, iPhone, iPad or Android — and you'll get one email when it's ready. That's all.
          </p>

          {/* Interactive Form */}
          {submitted ? (
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>Noted! We'll send you one email when {platform} is ready.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-accent/40"
              >
                <option value="Linux">Linux</option>
                <option value="iPhone / iOS">iPhone</option>
                <option value="iPad">iPad</option>
                <option value="Android">Android</option>
                <option value="Browser extension">Browser extension</option>
              </select>

              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-3.5 py-2.5 rounded-xl border border-border bg-card text-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-accent/40"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <span>Tell me where</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
