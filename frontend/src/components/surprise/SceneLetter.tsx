import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, Heart, FastForward, ArrowRight, ArrowLeft } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SceneLetterProps {
  letter: string;
  recipientName: string;
  senderName: string;
  onNext: () => void;
  onPrev: () => void;
}

export const SceneLetter: React.FC<SceneLetterProps> = ({
  letter,
  recipientName,
  senderName,
  onNext,
  onPrev
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);

  const fullLetter = letter || `Dearest ${recipientName || 'Friend'},\n\nHappy Birthday! Today is all about celebrating you—the rare, kind-hearted, and incredible person who brings so much light into the lives of everyone around you.\n\nWords often fall short when trying to express just how much you mean to me. You have been a continuous source of strength, pure joy, and inspiration in ways you might not even realize.\n\nMay this year ahead bring you profound peace, exhilarating adventures, good health, and the fulfillment of the dreams you hold closest to your heart.\n\nWith all my love and warmest wishes,\n${senderName || 'Me'} ✨`;

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    sound.playEnvelopeOpen();
    setIsOpen(true);
  };

  // Start typewriter when envelope opens
  useEffect(() => {
    if (!isOpen) return;
    if (isTypingComplete) return;

    // Small delay for envelope slide-out animation to finish
    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex += 2;
        if (currentIndex >= fullLetter.length) {
          setDisplayedText(fullLetter);
          setIsTypingComplete(true);
          sound.playSparkle();
          clearInterval(interval);
        } else {
          setDisplayedText(fullLetter.slice(0, currentIndex));
        }
      }, 25);

      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(startTimeout);
  }, [isOpen, fullLetter, isTypingComplete]);

  const handleSkipTyping = () => {
    sound.playClick();
    setDisplayedText(fullLetter);
    setIsTypingComplete(true);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 text-center relative z-10">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#FFD166] mb-3 backdrop-blur-sm">
          <Mail className="w-3.5 h-3.5" />
          <span>A Secret Delivery For You</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">
          Your Birthday Letter 💌
        </h2>
        <p className="text-sm text-[#FFBFA8]">
          {!isOpen ? "Touch the wax seal on the envelope to open it!" : "Written with love, straight from the heart."}
        </p>
      </motion.div>

      {/* Envelope & Letter Container */}
      <div className="relative max-w-2xl w-full flex flex-col items-center justify-center min-h-[380px]">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* 1. Closed Luxury 3D Envelope */
            <motion.div
              key="closed-envelope"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={handleOpenEnvelope}
              className="relative w-80 sm:w-96 h-56 sm:h-64 rounded-3xl bg-gradient-to-br from-[#FFDAC1] via-[#FFBFA8] to-[#E85B32] p-2 shadow-[0_20px_50px_rgba(232,91,50,0.35)] cursor-pointer select-none border-2 border-white/50 group"
            >
              {/* Inner Envelope pocket texture */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-t from-[#FFF0E6] to-white relative overflow-hidden flex flex-col items-center justify-center border border-white/60">
                {/* Envelope Flap triangular folds */}
                <div
                  className="absolute top-0 inset-x-0 h-28 bg-[#FFBFA8]/80 origin-top shadow-md"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />

                {/* Recipient Tag */}
                <div className="relative z-10 px-5 py-2.5 rounded-xl bg-white/90 shadow-sm border border-[#FFBFA8] text-center mt-12">
                  <span className="text-[10px] uppercase font-bold text-[#E85B32] tracking-widest block">
                    Private & Confidential
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#38251F]">
                    For: {recipientName || 'You'} ✨
                  </span>
                </div>

                {/* Wax Seal Button (Centrally positioned on flap point) */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 15px rgba(232,91,50,0.5)',
                      '0 0 25px rgba(232,91,50,0.8)',
                      '0 0 15px rgba(232,91,50,0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-20 z-20 w-16 h-16 rounded-full bg-[#E85B32] border-2 border-amber-200 flex flex-col items-center justify-center text-white shadow-xl cursor-pointer group-hover:scale-110 transition-transform"
                >
                  <Heart className="w-6 h-6 fill-white" />
                  <span className="text-[8px] font-black tracking-widest uppercase">OPEN</span>
                </motion.div>
              </div>

              {/* Pulsing prompt banner */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-10 inset-x-0 text-center"
              >
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                  <span>Touch Wax Seal to Open Letter</span>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            /* 2. Letter Slid Out of Envelope into Full Parchment Display */
            <motion.div
              key="opened-letter"
              initial={{ y: 80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-full p-8 sm:p-12 rounded-3xl bg-[#FFFDF9] text-[#38251F] shadow-[0_0_60px_rgba(255,191,168,0.3)] border-2 border-[#E8D8C8] text-left"
            >
              {/* Wax Seal accent */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#E85B32] shadow-md border-2 border-amber-200 flex flex-col items-center justify-center text-white rotate-6 select-none">
                <Heart className="w-4 h-4 fill-white" />
                <span className="text-[7px] font-bold tracking-widest uppercase">SEALED</span>
              </div>

              {/* Skip Typing Button */}
              {!isTypingComplete && (
                <button
                  onClick={handleSkipTyping}
                  className="absolute top-6 left-6 inline-flex items-center gap-1 text-[11px] font-semibold text-[#E85B32] bg-[#FFBFA8]/30 hover:bg-[#FFBFA8]/60 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Show Full Letter</span>
                </button>
              )}

              {/* Salutation */}
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#38251F] mb-6 pt-6">
                Dearest {recipientName || 'You'},
              </div>

              {/* Typewritten Text */}
              <div className="font-serif text-base sm:text-lg leading-relaxed text-[#38251F]/90 whitespace-pre-wrap min-h-[14rem]">
                {displayedText}
                {!isTypingComplete && (
                  <span className="inline-block w-2 h-5 bg-[#E85B32] ml-1 animate-pulse" />
                )}
              </div>

              {/* Handwritten Closing */}
              <div className="mt-8 pt-6 border-t border-[#E8D8C8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="font-handwriting text-3xl sm:text-4xl text-[#E85B32]">
                  With all my love, {senderName || 'Yours Always'} ❤️
                </div>
                <span className="text-xs text-gray-400 font-serif italic">
                  Forever & Always
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-12">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Balloons</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white text-sm font-bold shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Photo Memories 📸</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
