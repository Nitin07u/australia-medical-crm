import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Charm } from '../data/charms';
import { CardFlySource } from './HangingCharm';
import confetti from 'canvas-confetti';

interface CharmCardProps {
  charm: Charm;
  isSelected: boolean;
  onSelect: (charm: Charm, source?: CardFlySource) => void;
  onRitual?: (charm: Charm) => void;
}

export const CharmCard: React.FC<CharmCardProps> = ({
  charm,
  isSelected,
  onSelect,
  onRitual,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [swayImpulse, setSwayImpulse] = useState(0);

  const triggerSelectWithCoords = () => {
    let source: CardFlySource | undefined = undefined;
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      source = {
        charm,
        x: rect.left + rect.width / 2,
        y: rect.top + 90,
      };
    }
    onSelect(charm, source);
  };

  const handleCardClick = () => {
    triggerSelectWithCoords();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSelectWithCoords();

    setSwayImpulse(Math.random() > 0.5 ? 20 : -20);
    setTimeout(() => setSwayImpulse(0), 700);

    if (charm.ritual === 'garland') {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.55 },
        colors: ['#84CC16', '#EAB308', '#22C55E', '#16A34A'],
      });
    }

    onRitual?.(charm);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSwayImpulse(0);
      }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex flex-col items-center justify-between rounded-[18px] p-6 pb-7 bg-card cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-[1.5px] border-accent card-selected-shadow ring-1 ring-accent/15'
          : 'border border-border hover:border-border-strong card-shadow'
      }`}
      style={{
        minHeight: 445,
        width: '100%',
      }}
    >
      {/* Top Section with Hanging Thread and Charm Illustration */}
      <div className="relative w-full h-[155px] flex flex-col items-center justify-start overflow-visible pt-0">
        {/* Hanging Thread from Card Top Edge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[38px] hanging-string rounded-full z-0" />

        {/* Small Connector Bead */}
        <div className="absolute top-[36px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#B89B72] border border-[#7A6448] shadow-xs z-10" />

        {/* Charm Illustration */}
        <motion.div
          animate={{
            rotate: swayImpulse !== 0 ? swayImpulse : isHovered ? [0, -3.5, 3.5, -1, 0] : 0,
            scale: isHovered ? 1.03 : 1,
          }}
          transition={{
            duration: swayImpulse !== 0 ? 0.65 : 1.4,
            ease: 'easeInOut',
          }}
          className="absolute top-[40px] flex items-center justify-center select-none z-10"
        >
          {charm.id === 'emoji' ? (
            <div className="w-[85px] h-[85px] flex items-center justify-center text-[48px] filter drop-shadow-sm">
              <span>🍀</span>
            </div>
          ) : (
            <img
              src={charm.image}
              alt={charm.name}
              draggable={false}
              className="max-h-[92px] max-w-[80px] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.1)] transition-all duration-200"
            />
          )}
        </motion.div>
      </div>

      {/* Middle Text Info */}
      <div className="flex flex-col items-center text-center flex-grow justify-center w-full px-1">
        {/* Name */}
        <h3 className="font-editorial text-[20px] font-medium text-text-primary tracking-[-0.01em] mb-1.5">
          {charm.name}
        </h3>

        {/* Region Tag */}
        <div className="mb-3.5">
          <span className="inline-block text-[9.5px] tracking-[0.08em] font-semibold text-text-secondary bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-2.5 py-[2px] rounded-[4px] uppercase">
            {charm.region}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] leading-[1.62] text-text-secondary text-center max-w-[224px] font-normal">
          {charm.description}
        </p>
      </div>

      {/* Bottom Action Button */}
      <div className="w-full flex justify-center pt-5">
        <button
          onClick={handleButtonClick}
          className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 ${
            isSelected
              ? 'bg-accent text-white hover:bg-accent-hover shadow-xs active:scale-97'
              : 'border border-accent text-accent hover:bg-accent/5 active:scale-97 bg-transparent'
          }`}
        >
          {charm.buttonLabel}
        </button>
      </div>
    </motion.div>
  );
};
