import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharmPhysics } from '../hooks/useCharmPhysics';
import { Charm } from '../data/charms';

export interface CardFlySource {
  charm: Charm;
  x: number;
  y: number;
}

interface HangingCharmProps {
  charm: Charm;
  flySource?: CardFlySource | null;
  onFlyComplete?: () => void;
  className?: string;
  stringLength?: number;
  charmSize?: number;
  fixed?: boolean;
  onFlick?: () => void;
  interactive?: boolean;
}

export const HangingCharm: React.FC<HangingCharmProps> = ({
  charm,
  flySource,
  onFlyComplete,
  className = '',
  stringLength = 230,
  charmSize = 112,
  fixed = true,
  onFlick,
  interactive = true,
}) => {
  const {
    anchorX,
    setAnchorPosition,
    isDragging,
    isHovered,
    setIsHovered,
    motionState,
    triggerFlick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCharmPhysics({
    baseLength: stringLength,
    gravity: 1400,
    damping: 1.45,
    idleAmplitude: 0.028,
    idleFrequency: 1.0,
  });

  const [isFlying, setIsFlying] = useState(false);
  const [isDraggingAnchor, setIsDraggingAnchor] = useState(false);

  useEffect(() => {
    if (flySource && flySource.charm.id === charm.id) {
      setIsFlying(true);
    }
  }, [flySource, charm.id]);

  const handleFlyAnimationComplete = () => {
    setIsFlying(false);
    onFlyComplete?.();
    triggerFlick(3.2);
  };

  const handleAnchorPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingAnchor(true);
  };

  const handleAnchorPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingAnchor) return;
    setAnchorPosition(e.clientX);
  };

  const handleAnchorPointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingAnchor(false);
    triggerFlick(1.8);
  };

  const isCustomEmoji = charm.id === 'emoji' && !charm.image.includes('/');

  return (
    <>
      {/* 
        ========================================================================
        LAYER 2: PHYSICAL SCREEN OVERLAY
        Fixed to the top edge of the browser window (y = 0)
        ========================================================================
      */}
      <div
        className={`fixed inset-0 pointer-events-none select-none z-50 overflow-hidden ${className}`}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Top Edge Physical Mount Notch (attaches to browser/screen bezel) */}
        <div
          onPointerDown={handleAnchorPointerDown}
          onPointerMove={handleAnchorPointerMove}
          onPointerUp={handleAnchorPointerUp}
          onPointerCancel={handleAnchorPointerUp}
          title="Drag along top edge to move charm"
          style={{
            position: 'absolute',
            top: 0,
            left: anchorX,
            transform: 'translateX(-50%)',
          }}
          className="pointer-events-auto cursor-ew-resize flex flex-col items-center group z-50"
        >
          <div className="w-3.5 h-1.5 bg-[#8C7A65] dark:bg-[#A3907C] rounded-b-xs shadow-xs group-hover:scale-125 transition-transform" />
          <div className="w-1.5 h-1 bg-[#D4AF37] rounded-full -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* The Swinging Pendulum Root anchored at viewport (anchorX, 0) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: anchorX,
            transform: 'translateX(-50%)',
            opacity: isFlying ? 0 : 1,
            transition: 'opacity 0.15s ease',
          }}
          className="flex flex-col items-center"
        >
          {/* Top Anchor Notch */}
          <div className="w-2.5 h-1 bg-[#8C7A65] dark:bg-[#A3907C] rounded-b-xs shadow-xs z-10" />

          {/* SVG Flexible Gold String connecting from (0,0) down to charm (x, y) */}
          <svg
            className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible pointer-events-none"
            style={{ width: 1, height: 1 }}
          >
            {/* Subtle soft cast shadow */}
            <line
              x1={2}
              y1={2}
              x2={motionState.x + 2}
              y2={motionState.y - 30}
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Gold string matching reference */}
            <line
              x1={0}
              y1={0}
              x2={motionState.x}
              y2={motionState.y - 30}
              stroke="#B39352"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-[#D4AF37]"
            />
          </svg>

          {/* Charm Body positioned at (x, y) with angular rotation */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(calc(-50% + ${motionState.x}px), ${motionState.y - 36}px) rotate(${motionState.angle}deg)`,
              transformOrigin: '50% 0px',
            }}
            className="flex flex-col items-center"
          >
            {/* Authentic 3-Bead Ornament: Gold Bead - Vibrant Red Bead - Gold Bead */}
            <div className="flex flex-col items-center -space-y-0.5 z-20 pointer-events-none mb-1">
              <div className="w-2 h-2 rounded-full bg-[#E5C158] border border-[#B38F2E] shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#DC2626] border border-[#991B1B] shadow-xs" />
              <div className="w-2 h-2 rounded-full bg-[#E5C158] border border-[#B38F2E] shadow-xs" />
            </div>

            {/* Interactive Charm Body Surface with Ambient Drop Shadow */}
            <motion.div
              onPointerDown={interactive ? handlePointerDown : undefined}
              onPointerMove={interactive ? handlePointerMove : undefined}
              onPointerUp={interactive ? handlePointerUp : undefined}
              onPointerCancel={interactive ? handlePointerUp : undefined}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="pointer-events-auto relative cursor-grab active:cursor-grabbing flex flex-col items-center group select-none"
              style={{
                touchAction: 'none',
              }}
            >
              {/* Soft, Wide Radial Ambient Blur Shadow behind the Charm */}
              <div
                className="absolute inset-0 bg-black/20 dark:bg-black/45 rounded-full blur-2xl pointer-events-none"
                style={{
                  transform: `scale(${isDragging ? 0.85 : 1.1}) translateY(16px)`,
                  opacity: isDragging ? 0.3 : 0.65,
                }}
              />

              {/* Charm Graphic */}
              <div className="relative z-10">
                {isCustomEmoji ? (
                  <div
                    className="flex items-center justify-center select-none"
                    style={{ width: charmSize, height: charmSize, fontSize: charmSize * 0.7 }}
                  >
                    <span className="transform transition-transform hover:scale-108">
                      {charm.image}
                    </span>
                  </div>
                ) : (
                  <img
                    src={charm.image}
                    alt={charm.name}
                    draggable={false}
                    className="object-contain pointer-events-none transition-transform duration-150 group-hover:scale-103 drop-shadow-[0_12px_18px_rgba(0,0,0,0.12)]"
                    style={{
                      width: charmSize,
                      maxHeight: charmSize * 1.85,
                    }}
                  />
                )}
              </div>

              {/* Subtle hover hint */}
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-900/85 text-white text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm z-30">
                Flick or drag
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fly-Up Selection Spring Animation from Card to Top Anchor */}
      <AnimatePresence>
        {isFlying && flySource && (
          <motion.div
            initial={{
              position: 'fixed',
              left: flySource.x,
              top: flySource.y,
              x: '-50%',
              y: '-50%',
              scale: 0.85,
              opacity: 0.9,
              rotate: 0,
              zIndex: 60,
            }}
            animate={{
              left: anchorX,
              top: stringLength,
              x: '-50%',
              y: '0%',
              scale: 1,
              opacity: 1,
              rotate: [0, -14, 10, -4, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 130,
              damping: 14,
              mass: 0.9,
            }}
            onAnimationComplete={handleFlyAnimationComplete}
            className="pointer-events-none fixed flex flex-col items-center select-none"
          >
            {/* Flying Beads */}
            <div className="flex flex-col items-center -space-y-0.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#E5C158]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#DC2626]" />
              <div className="w-2 h-2 rounded-full bg-[#E5C158]" />
            </div>

            {isCustomEmoji ? (
              <div
                className="flex items-center justify-center select-none text-5xl"
                style={{ width: charmSize, height: charmSize }}
              >
                <span>{charm.image}</span>
              </div>
            ) : (
              <img
                src={charm.image}
                alt={charm.name}
                className="object-contain"
                style={{
                  width: charmSize,
                  maxHeight: charmSize * 1.85,
                  filter: 'drop-shadow(0 18px 24px rgba(15, 23, 42, 0.22))',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
