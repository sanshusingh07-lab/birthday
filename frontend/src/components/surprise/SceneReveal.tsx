import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import { fireCelebrationConfetti } from '../../utils/confetti';
import { sound } from '../../utils/audio';

interface SceneRevealProps {
  recipientName: string;
  senderName: string;
  birthdayMessage?: string;
  onNext: () => void;
}

export const SceneReveal: React.FC<SceneRevealProps> = ({ recipientName, senderName, onNext }) => {
  useEffect(() => {
    // Initial grand fanfare & confetti burst
    sound.playFanfare();
    fireCelebrationConfetti();
    const timer = setTimeout(() => {
      fireCelebrationConfetti();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 z-10 relative">
      {/* Heart-Shaped Floating Balloon Cluster */}
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
          {/* Heart Balloon 1 (Center) */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-36 rounded-t-full rounded-b-3xl bg-gradient-to-tr from-[#E85B32] via-[#FF6B8B] to-[#FFBFA8] p-4 flex flex-col items-center justify-center shadow-2xl shadow-[#E85B32]/50 text-white z-20 border border-white/30"
          >
            <Heart className="w-12 h-12 fill-white drop-shadow-md" />
            <span className="text-[11px] font-bold tracking-widest uppercase mt-1">FOR YOU</span>
            <div className="w-0.5 h-12 bg-white/40 absolute -bottom-12" />
          </motion.div>

          {/* Balloon 2 (Left) */}
          <motion.div
            animate={{
              y: [4, -8, 4],
              rotate: [-6, 4, -6]
            }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute -left-4 top-4 w-24 h-28 rounded-t-full rounded-b-2xl bg-gradient-to-tr from-[#9D4EDD] to-[#FF80AB] flex items-center justify-center shadow-xl shadow-purple-500/30 text-white z-10 border border-white/20"
          >
            <Sparkles className="w-7 h-7" />
            <div className="w-0.5 h-14 bg-white/30 absolute -bottom-14" />
          </motion.div>

          {/* Balloon 3 (Right) */}
          <motion.div
            animate={{
              y: [-5, 7, -5],
              rotate: [5, -5, 5]
            }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -right-4 top-2 w-24 h-28 rounded-t-full rounded-b-2xl bg-gradient-to-tr from-[#FFD166] to-[#E85B32] flex items-center justify-center shadow-xl shadow-orange-500/30 text-white z-10 border border-white/20"
          >
            <span className="text-xl">🎂</span>
            <div className="w-0.5 h-14 bg-white/30 absolute -bottom-14" />
          </motion.div>
        </div>
      </motion.div>

      {/* Official Day Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FFD166] text-xs uppercase tracking-widest font-bold mb-4 backdrop-blur-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
        <span>It's Officially Your Day!</span>
      </motion.div>

      {/* Recipient Name Heading */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="font-serif text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-[0_0_35px_rgba(232,91,50,0.6)]"
      >
        Happy Birthday, <br />
        <span className="bg-gradient-to-r from-[#FFD166] via-[#FF80AB] to-[#FFBFA8] bg-clip-text text-transparent">
          {recipientName || 'You'}!
        </span>
      </motion.h1>

      {/* Subtitle from sender */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-lg sm:text-xl text-[#FFBFA8]/90 font-light max-w-xl mx-auto mb-10"
      >
        A personalized surprise handcrafted with love by <span className="font-semibold text-white">{senderName || 'someone who loves you'}</span>.
      </motion.p>

      {/* User Requested: "Touch To Go To Next Page" Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <button
          onClick={onNext}
          className="px-8 sm:px-10 py-4 sm:py-5 rounded-3xl bg-gradient-to-r from-[#E85B32] via-[#FF6B8B] to-[#FFD166] hover:from-[#d44e26] hover:to-[#f3c24b] text-white font-extrabold text-base sm:text-lg shadow-2xl shadow-[#E85B32]/50 hover:shadow-[#E85B32]/70 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Make a Wish 🎂</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};
