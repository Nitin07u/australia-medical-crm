import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Play, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BlessMomentProps {
  onTriggerBless?: () => void;
}

export const BlessMoment: React.FC<BlessMomentProps> = ({ onTriggerBless }) => {
  const [copied, setCopied] = useState(false);
  const [blessed, setBlessed] = useState(false);

  const codeString = `# before a deploy, a demo, a big meeting\nopen "luckydangle://bless"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlessClick = () => {
    setBlessed(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B'],
    });
    onTriggerBless?.();
    setTimeout(() => setBlessed(false), 1500);
  };

  return (
    <section className="py-20 sm:py-28 relative border-t border-border/40">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl mb-10">
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-text-primary tracking-[-0.02em] leading-tight mb-4">
            Bless a moment
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal">
            Lucky Dangle also listens for <code className="text-sm font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">luckydangle://</code>. Add one line to a script, shortcut, or git hook and the charm comes forward, drops in, and performs its ritual right on cue.
          </p>
        </div>

        {/* Developer Easter Egg Code Block */}
        <div className="max-w-xl">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#1E293B] bg-[#0F172A] text-slate-200">
            {/* Top terminal bar */}
            <div className="px-4 py-2.5 bg-[#1E293B]/70 border-b border-[#334155]/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">terminal / bash</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700/50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code lines */}
            <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed">
              <div className="text-slate-500 italic"># before a deploy, a demo, a big meeting</div>
              <div className="mt-1 flex items-center justify-between group">
                <div>
                  <span className="text-emerald-400">open</span>{' '}
                  <span className="text-amber-300">"luckydangle://bless"</span>
                </div>
                <button
                  onClick={handleBlessClick}
                  className="opacity-80 group-hover:opacity-100 px-2.5 py-1 rounded-md bg-accent/20 hover:bg-accent text-accent-light hover:text-white text-[11px] font-sans flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{blessed ? 'Blessing...' : 'Run ritual'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
