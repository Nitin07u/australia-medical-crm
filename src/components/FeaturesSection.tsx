import React from 'react';
import { motion } from 'framer-motion';
import { AppWindow, Keyboard, Target, MessageSquare } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const cards = [
    {
      icon: <AppWindow className="w-5 h-5 text-accent" />,
      title: 'Keep it close',
      description:
        'It hangs quietly at the top of your screen and never gets in the way. On crowded days on the Mac, send it behind your windows and it keeps watch from the desktop.',
    },
    {
      icon: <Keyboard className="w-5 h-5 text-accent" />,
      title: 'Call it down',
      description:
        'Hide it on ordinary days. Bring it back before a deploy, demo, interview, or anything else that could use some luck. Here, ⌃D toggles it and ⌃S performs its ritual.',
    },
    {
      icon: <Target className="w-5 h-5 text-accent" />,
      title: 'Give it a ritual',
      description:
        "Paint the daruma's eye. Replace a tired garland. Repaint the guardian. Every charm has one small thing it can do.",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-accent" />,
      title: 'Share the story',
      description:
        'It shows up in screenshots and screen shares. When someone asks, you have a story to tell.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="max-w-2xl mb-14 sm:mb-18">
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-text-primary tracking-[-0.02em] leading-tight mb-4">
            Make it yours
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal">
            Leave it there for company or call it down when the moment needs something extra.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-[1060px]">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-card border border-border rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:border-border-strong hover:shadow-card-hover transition-all duration-300 shadow-subtle"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="font-editorial text-2xl font-medium text-text-primary mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-[15px] text-text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
