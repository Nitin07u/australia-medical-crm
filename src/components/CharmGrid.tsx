import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Charm, charms } from '../data/charms';
import { CharmCard } from './CharmCard';
import { CardFlySource } from './HangingCharm';
import { X, Check } from 'lucide-react';

interface CharmGridProps {
  selectedCharm: Charm;
  onSelectCharm: (charm: Charm, source?: CardFlySource) => void;
}

export const CharmGrid: React.FC<CharmGridProps> = ({
  selectedCharm,
  onSelectCharm,
}) => {
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);

  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [charmsList, setCharmsList] = useState<Charm[]>(charms);

  const popularEmojis = ['🍀', '🧿', '✨', '🎋', '🪬', '🏮', '🐸', '🪙', '🌟', '🎏', '🌸', '🪄'];

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestInput.trim()) return;
    setSuggestSubmitted(true);
    setTimeout(() => {
      setSuggestSubmitted(false);
      setShowSuggestModal(false);
      setSuggestInput('');
    }, 1500);
  };

  const handlePickEmoji = (emoji: string) => {
    const updated = charmsList.map((c) =>
      c.id === 'emoji' ? { ...c, image: emoji } : c
    );
    setCharmsList(updated);
    const emojiCharm = updated.find((c) => c.id === 'emoji');
    if (emojiCharm) {
      onSelectCharm(emojiCharm);
    }
    setShowEmojiModal(false);
  };

  const handleCardRitual = (charm: Charm) => {
    if (charm.id === 'emoji') {
      setShowEmojiModal(true);
    }
  };

  return (
    <section id="charms" className="pt-8 pb-20 sm:pb-28 relative">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="font-editorial text-3xl sm:text-[42px] font-normal text-text-primary tracking-[-0.02em] leading-[1.15] mb-3">
            Choose your charm
          </h2>
          <p className="text-[15px] sm:text-base text-text-secondary leading-relaxed font-normal">
            Each one comes from a tradition around the world, with a small ritual of its own. Pick a charm to hang it on this page.
          </p>
        </div>

        {/* 3-Column Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-[940px]">
          {charmsList.map((charm) => (
            <CharmCard
              key={charm.id}
              charm={charm}
              isSelected={selectedCharm.id === charm.id}
              onSelect={onSelectCharm}
              onRitual={handleCardRitual}
            />
          ))}
        </div>

        {/* Suggestion Line */}
        <div className="mt-9 text-[13.5px] sm:text-[14px] text-text-secondary flex flex-wrap items-center gap-1.5">
          <span>Missing the charm you grew up with?</span>
          <button
            onClick={() => setShowSuggestModal(true)}
            className="text-accent font-semibold hover:underline inline-flex items-center"
          >
            Suggest a dangle.
          </button>
          <span className="text-text-secondary ml-0.5">New charms arrive in free updates.</span>
        </div>
      </div>

      {/* Suggest a Dangle Modal */}
      <AnimatePresence>
        {showSuggestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowSuggestModal(false)}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-editorial text-2xl text-text-primary mb-2">
                Suggest a dangle
              </h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Tell us about a lucky charm, talisman, or protective symbol from your culture or upbringing that you'd love to see hanging on screens.
              </p>

              {suggestSubmitted ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-accent">
                  <Check className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium text-text-primary">Thank you for your suggestion!</p>
                  <p className="text-xs text-text-secondary mt-1">We'll review it for the next collection update.</p>
                </div>
              ) : (
                <form onSubmit={handleSuggestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Charm Name & Cultural Origin
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cornicello (Italy) or Dreamcatcher"
                      value={suggestInput}
                      onChange={(e) => setSuggestInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSuggestModal(false)}
                      className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-xs"
                    >
                      Submit suggestion
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Modal */}
      <AnimatePresence>
        {showEmojiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowEmojiModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-editorial text-2xl text-text-primary mb-2">
                Pick your lucky emoji
              </h3>
              <p className="text-xs text-text-secondary mb-5">
                Choose any emoji to hang from your screen.
              </p>

              <div className="grid grid-cols-4 gap-3 py-2">
                {popularEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handlePickEmoji(emoji)}
                    className="h-14 flex items-center justify-center text-3xl rounded-xl border border-border hover:border-accent hover:bg-accent/10 transition-all hover:scale-105"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
