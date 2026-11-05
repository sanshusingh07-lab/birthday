import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Share2, PlusCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { sound } from '../../utils/audio';
import { fireCelebrationConfetti, fireFireworksSequence } from '../../utils/confetti';

interface SceneCelebrationProps {
  recipientName: string;
  senderName: string;
  onReplay: () => void;
  onShare?: () => void;
  onCreateNew?: () => void;
  onPrev: () => void;
  isRecipient?: boolean;
}

export const SceneCelebration: React.FC<SceneCelebrationProps> = ({
  recipientName,
  senderName,
  onReplay,
  onShare,
  onCreateNew,
  onPrev,
  isRecipient = false
}) => {
  useEffect(() => {
    // Erupt continuous fireworks on finale entrance
    sound.playFanfare();
    fireCelebrationConfetti();
    fireFireworksSequence(6000);
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 z-10 relative">
      {/* Decorative Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FFD166] text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Grand Birthday Finale 🎆</span>
      </motion.div>

      {/* Floating Animated Celebration Icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [-4, 4, -4]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#E85B32] via-[#FF6B8B] to-[#FFD166] p-4 flex items-center justify-center text-4xl shadow-2xl shadow-[#E85B32]/40 border-2 border-white/40 mb-8"
      >
        🎁
      </motion.div>

      {/* Required Quote */}
      <motion.blockquote
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight mb-6 drop-shadow-[0_0_30px_rgba(255,209,102,0.45)]"
      >
        "May your life always be filled with happiness, laughter, and beautiful memories."
      </motion.blockquote>

      {/* Personal closing sign-off */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-base sm:text-lg text-[#FFBFA8] font-light max-w-xl mx-auto mb-10"
      >
        Happy Birthday, {recipientName || 'You'}! Always wishing the absolute best for you. <br />
        <span className="font-handwriting text-3xl sm:text-4xl text-white block mt-3">
          With all my love, {senderName || 'Your Loved One'} ❤️
        </span>
      </motion.p>

      {/* Action Buttons: Strict separation for Recipient */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto mb-8"
      >
        {/* 1. Replay Birthday Surprise */}
        <button
          onClick={onReplay}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white font-bold text-sm shadow-xl shadow-[#E85B32]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-white" />
          <span>Replay Birthday Surprise ✨</span>
        </button>

        {/* Creator-Only Action Buttons (Hidden for recipient) */}
        {!isRecipient && onShare && (
          <button
            onClick={onShare}
            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Surprise</span>
          </button>
        )}

        {!isRecipient && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#06D6A0]" />
            <span>Create Another Surprise</span>
          </button>
        )}
      </motion.div>

      {/* Back button */}
      <button
        onClick={onPrev}
        className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Previous: Memories</span>
      </button>
    </div>
  );
};
