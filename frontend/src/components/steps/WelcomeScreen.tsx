import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Gift, MessageCircleHeart, Image as ImageIcon, Wand2, ArrowRight } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { sound } from '../../utils/audio';

export const WelcomeScreen: React.FC = () => {
  const { nextStep, loadDemoSurprise } = useBirthday();

  const handleStart = () => {
    sound.playSparkle();
    nextStep();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative center hero glow */}
      <div className="max-w-4xl w-full text-center relative z-10">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#FFBFA8] text-[#E85B32] shadow-sm mb-6"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow text-[#E85B32]" />
          <span className="text-xs uppercase tracking-wider font-semibold">The Ultimate Digital Birthday Gift</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#38251F] leading-[1.15] mb-6"
        >
          Make Their Birthday <br />
          <span className="bg-gradient-to-r from-[#E85B32] via-[#F7A6A0] to-[#E85B32] bg-clip-text text-transparent">
            Unforgettable
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-[#38251F]/80 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Create a little magic, one memory at a time.
        </motion.p>

        {/* Hero Interactive Illustration Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-lg mx-auto mb-12"
        >
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/90 to-[#FFF0E6]/80 border border-[#FFBFA8]/60 shadow-xl shadow-[#E85B32]/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-6">
              {/* Floating Balloon */}
              <motion.div
                animate={{ y: [-8, 8, -8], rotate: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-20 rounded-t-full rounded-b-2xl bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] flex items-center justify-center shadow-lg shadow-[#E85B32]/30 text-white text-2xl"
              >
                🎈
              </motion.div>

              {/* Gift Box with Pulsing Glow */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#F7A6A0] to-[#FFBFA8] p-4 flex flex-col items-center justify-center shadow-2xl shadow-[#E85B32]/20 border-2 border-white"
              >
                <Gift className="w-10 h-10 text-white drop-shadow-md" />
                <span className="text-[10px] font-bold text-white tracking-wider uppercase mt-1">Surprise</span>
              </motion.div>

              {/* Polaroid Memory Preview */}
              <motion.div
                animate={{ y: [8, -8, 8], rotate: [4, -4, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-20 bg-white p-1.5 rounded-lg shadow-md border border-gray-200 rotate-6 flex flex-col"
              >
                <div className="w-full h-12 bg-gradient-to-br from-pink-200 to-amber-100 rounded-xs flex items-center justify-center text-xs">
                  📸
                </div>
                <div className="mt-1 h-1.5 bg-[#FFBFA8]/50 rounded-full w-3/4 mx-auto" />
              </motion.div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#38251F]/70 font-medium">
              ✨ Interactive balloons, personal letters, memory polaroids & fireworks!
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-semibold text-base sm:text-lg shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl hover:shadow-[#E85B32]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={loadDemoSurprise}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/80 hover:bg-white text-[#38251F] font-semibold text-base border border-[#FFBFA8] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-5 h-5 text-[#E85B32]" />
            <span>See Live Sample Experience</span>
          </button>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="border-t border-[#FFBFA8]/50 pt-12"
        >
          <h2 className="text-xs uppercase font-bold tracking-widest text-[#E85B32] mb-8">
            How It Works in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white/70 border border-[#FFBFA8]/40 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FFBFA8]/40 text-[#E85B32] flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-[#38251F]">Fill the Balloons</h3>
              <p className="text-sm text-[#38251F]/70 leading-relaxed">
                Enter their name and answer fun, heartfelt questions. Each answer transforms into an interactive floating balloon they can pop!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 border border-[#FFBFA8]/40 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F7A6A0]/40 text-[#E85B32] flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-[#38251F]">Add Photos & Letter</h3>
              <p className="text-sm text-[#38251F]/70 leading-relaxed">
                Upload your favourite photos as vintage polaroids and write a touching birthday letter with our AI letter writer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 border border-[#FFBFA8]/40 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#E85B32]/20 text-[#E85B32] flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-[#38251F]">Share The Magic</h3>
              <p className="text-sm text-[#38251F]/70 leading-relaxed">
                Generate a unique link. When they open it, a deep starry sky with music, floating balloons, memories, and fireworks unfolds!
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

