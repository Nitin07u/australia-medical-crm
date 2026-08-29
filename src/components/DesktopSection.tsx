import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Battery, Search, Volume2 } from 'lucide-react';

export const DesktopSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  const features = [
    'Stays in the menu bar on Mac and the tray on Windows, with no Dock icon or open window.',
    'Only the charm catches your cursor. Everything else clicks straight through.',
    'Keyboard shortcuts dangle it or perform its ritual. On the Mac, choose your own.',
    'Drag it along the top edge to re-hang it anywhere on your screen.',
    'Meet every charm and its story in the built-in gallery.',
    'New charms arrive through free, built-in updates.',
  ];

  return (
    <section id="desktop" className="pt-10 pb-20 sm:pb-28 relative">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12 sm:mb-14">
          <h2 className="font-editorial text-3xl sm:text-[42px] font-normal text-text-primary tracking-[-0.02em] leading-[1.15] mb-3">
            At home on your Mac or PC
          </h2>
          <p className="text-[15px] sm:text-base text-text-secondary leading-relaxed font-normal">
            Lucky Dangle lives in the menu bar on Mac and the tray on Windows, and leaves the rest of your machine alone.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center max-w-[1080px]">
          {/* Left Column: Mac Desktop Screen */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[16px] overflow-hidden shadow-2xl border border-[#20293A] bg-[#0A1224] group">
              {/* macOS Top Menu Bar */}
              <div className="bg-[#101827] text-slate-300 px-4 py-2 flex items-center justify-between border-b border-[#1E293B]/70 select-none">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/80" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 pl-1">Lucky Dangle</span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-300 font-sans">
                  <Wifi className="w-3.5 h-3.5" />
                  <Volume2 className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5" />
                  <Search className="w-3.5 h-3.5" />
                  <span className="text-[10.5px] font-medium tracking-tight">Sun 9 Aug 22:33</span>
                </div>
              </div>

              {/* Video container */}
              <div className="relative aspect-[16/10] bg-[#0D1E3A] flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src="/mac-demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={() => setVideoError(true)}
                />

                {/* Fallback interactive simulation if needed */}
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1A30]">
                    <div className="hanging-string w-[1.5px] h-32 absolute top-0" />
                    <img
                      src="/charms/nimbu-mirchi.png"
                      alt="Mac demo charm"
                      className="w-16 object-contain drop-shadow-xl animate-pulse"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Bezel */}
              <div className="h-3.5 bg-[#0A1224] border-t border-[#162136] flex items-center justify-center">
                <div className="w-10 h-1 bg-[#1E2C4A] rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Column: Feature Bullet List */}
          <div className="lg:col-span-5">
            <ul className="space-y-6">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-3 text-[14.5px] sm:text-[15px] text-text-primary leading-[1.65]"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-primary mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
