import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import type { BirthdayWish } from '../../types/birthday';
import { sound } from '../../utils/audio';
import { fireBalloonPopConfetti } from '../../utils/confetti';

interface SceneBalloonsProps {
  wishes: BirthdayWish[];
  recipientName: string;
  onNext: () => void;
  onPrev: () => void;
}

interface BalloonTheme {
  name: string;
  gradStart: string;
  gradEnd: string;
  glow: string;
  borderGlow: string;
}

const BALLOON_THEMES: BalloonTheme[] = [
  {
    name: 'Blush Rose',
    gradStart: '#FF758F',
    gradEnd: '#D90429',
    glow: 'rgba(255, 117, 143, 0.4)',
    borderGlow: 'rgba(255, 180, 195, 0.6)'
  },
  {
    name: 'Lavender Violet',
    gradStart: '#C77DFF',
    gradEnd: '#7B2CBF',
    glow: 'rgba(199, 125, 255, 0.4)',
    borderGlow: 'rgba(224, 170, 255, 0.6)'
  },
  {
    name: 'Seafoam Mint',
    gradStart: '#52B788',
    gradEnd: '#1B4332',
    glow: 'rgba(82, 183, 136, 0.4)',
    borderGlow: 'rgba(149, 213, 178, 0.6)'
  },
  {
    name: 'Golden Peach',
    gradStart: '#FFB703',
    gradEnd: '#FB8500',
    glow: 'rgba(255, 183, 3, 0.4)',
    borderGlow: 'rgba(255, 214, 112, 0.6)'
  },
  {
    name: 'Sky Cyan',
    gradStart: '#48CAE4',
    gradEnd: '#0077B6',
    glow: 'rgba(72, 202, 228, 0.4)',
    borderGlow: 'rgba(144, 224, 239, 0.6)'
  }
];

export const SceneBalloons: React.FC<SceneBalloonsProps> = ({ wishes, recipientName, onNext, onPrev }) => {
  const [poppedIndices, setPoppedIndices] = useState<number[]>([]);

  const displayWishes: BirthdayWish[] = wishes.length > 0 ? wishes : [
    { question: "What makes you special?", answer: "You make every single day brighter with your genuine kindness 😄" },
    { question: "What I love most about you", answer: "The moon is nothing compared to your radiant soul ✨" },
    { question: "My favourite memory", answer: "Your laugh is my absolute favourite sound in the world 📻" }
  ];

  const handlePopBalloon = (index: number, e: React.MouseEvent) => {
    sound.playBalloonPop();
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (rect.left + rect.width / 2) / window.innerWidth;
    const yRatio = (rect.top + rect.height / 2) / window.innerHeight;
    fireBalloonPopConfetti(xRatio, yRatio);

    if (!poppedIndices.includes(index)) {
      setPoppedIndices(prev => [...prev, index]);
    }
  };

  const allPopped = poppedIndices.length === displayWishes.length;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 text-center relative z-10 max-w-4xl mx-auto">
      {/* Title Header matching reference video */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="font-serif text-3xl sm:text-5xl font-black text-white flex items-center justify-center gap-2 mb-2">
          <span>Pop the balloons</span>
          <span>🎈</span>
        </h2>
        <p className="text-sm sm:text-base text-[#FFBFA8] max-w-lg mx-auto">
          {displayWishes.length} balloons. Each one holds a reason you're loved. Pop them all 🎈
        </p>

        {/* Counter Pill */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white border border-white/15">
          <span>{poppedIndices.length} of {displayWishes.length} Popped</span>
          {allPopped && <span className="text-emerald-400 font-bold">✨ All Unlocked!</span>}
        </div>
      </motion.div>

      {/* Floating 3D Balloons Area */}
      <div className="relative min-h-[260px] w-full flex items-center justify-center gap-6 sm:gap-12 flex-wrap mb-10">
        {displayWishes.map((w, index) => {
          const isPopped = poppedIndices.includes(index);
          const theme = BALLOON_THEMES[index % BALLOON_THEMES.length];
          const delayOffset = (index % 3) * 0.4;
          const heightOffset = index % 2 === 0 ? -15 : 15;

          return (
            <div key={index} className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                {!isPopped ? (
                  <motion.div
                    key={`balloon-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: [heightOffset - 10, heightOffset + 12, heightOffset - 10],
                      rotate: index % 2 === 0 ? [-3, 3, -3] : [3, -3, 3]
                    }}
                    exit={{
                      scale: [1, 1.3, 0],
                      opacity: 0,
                      transition: { duration: 0.2 }
                    }}
                    transition={{
                      y: {
                        duration: 3.5 + (index % 2) * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delayOffset
                      },
                      rotate: {
                        duration: 4.2 + (index % 2) * 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delayOffset
                      }
                    }}
                    whileHover={{ scale: 1.12, y: heightOffset - 8 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={e => handlePopBalloon(index, e)}
                    className="relative cursor-pointer select-none group flex flex-col items-center"
                    title="Click to pop!"
                  >
                    {/* Realistic 3D Balloon SVG matching user reference video */}
                    <svg
                      width="120"
                      height="200"
                      viewBox="0 0 100 170"
                      className="overflow-visible filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                    >
                      <defs>
                        {/* Radial 3D sphere gradient */}
                        <radialGradient
                          id={`balloonGrad-${index}`}
                          cx="35%"
                          cy="35%"
                          r="65%"
                          fx="30%"
                          fy="30%"
                        >
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                          <stop offset="25%" stopColor={theme.gradStart} />
                          <stop offset="85%" stopColor={theme.gradEnd} />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                        </radialGradient>
                      </defs>

                      {/* Realistic Teardrop / Oval Balloon Body */}
                      <path
                        d="M 50 5 
                           C 22 5 3 30 3 66 
                           C 3 105 35 136 45 144 
                           L 43 149 
                           L 57 149 
                           L 55 144 
                           C 65 136 97 105 97 66 
                           C 97 30 78 5 50 5 Z"
                        fill={`url(#balloonGrad-${index})`}
                        stroke={theme.borderGlow}
                        strokeWidth="1"
                      />

                      {/* Specular curved reflection highlight on top-left */}
                      <ellipse
                        cx="32"
                        cy="36"
                        rx="9"
                        ry="18"
                        transform="rotate(-28 32 36)"
                        fill="#FFFFFF"
                        opacity="0.55"
                      />
                      <circle cx="26" cy="62" r="3.5" fill="#FFFFFF" opacity="0.35" />

                      {/* Tied Knot at bottom of balloon */}
                      <polygon
                        points="46,145 54,145 58,151 42,151"
                        fill={theme.gradEnd}
                      />

                      {/* Organic Wavy Balloon String Dangling Down */}
                      <path
                        d="M 50,151 Q 45,175 55,200 T 47,235"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Cute hover pill */}
                    <span className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white uppercase tracking-widest bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full pointer-events-none group-hover:scale-110 transition-transform">
                      POP ME!
                    </span>
                  </motion.div>
                ) : (
                  /* Popped Placeholder Tag */
                  <motion.div
                    key={`popped-${index}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center p-2 text-white/70 shadow-sm"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#FFD166] mb-1" />
                    <span className="text-[10px] font-bold text-white">#{index + 1} Popped</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Revealed Reason Cards (Exact match to reference video vid1_frame_3.jpg) */}
      <div className="w-full max-w-xl mx-auto space-y-3 mb-8">
        {displayWishes.map((w, idx) => {
          const isPopped = poppedIndices.includes(idx);
          if (!isPopped) return null;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="p-4 sm:p-5 rounded-2xl text-left relative overflow-hidden backdrop-blur-md border border-white/20 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(43, 22, 80, 0.85) 0%, rgba(25, 13, 48, 0.95) 100%)'
              }}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85B32]/30 border border-[#E85B32]/50 text-[#FFD166] text-[11px] font-bold uppercase tracking-wider">
                  <span>REASON NO. {idx + 1}</span>
                  <Heart className="w-3 h-3 fill-[#FFD166]" />
                </span>
                <Sparkles className="w-4 h-4 text-[#FFD166]" />
              </div>

              {/* Revealed Message */}
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                {w.answer}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* All Popped Final Blessing prompt */}
      {allPopped && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <p className="font-serif italic text-base sm:text-lg text-[#FFD166]">
            "...and a thousand more reasons 💛"
          </p>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-xl mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Cake</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white text-sm font-bold shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Open Secret Letter 💌</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
