import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';
import { fireCelebrationConfetti, fireFireworksSequence } from '../../utils/confetti';

interface SceneCakeProps {
  recipientName: string;
  onNext: () => void;
  onPrev: () => void;
}

export const SceneCake: React.FC<SceneCakeProps> = ({ recipientName, onNext, onPrev }) => {
  // Build stages:
  // 0: Initial plate
  // 1: Sponge cake layers assemble
  // 2: Cream frosting drips down
  // 3: Candy sprinkles drop
  // 4: Candle lands
  // 5: Flame ignites & ready to blow!
  const [buildStep, setBuildStep] = useState<number>(0);
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Baking something sweet...");

  useEffect(() => {
    // Sequential automated cake building
    const timer1 = setTimeout(() => {
      setBuildStep(1);
      sound.playClick();
    }, 800);

    const timer2 = setTimeout(() => {
      setBuildStep(2);
      setStatusText("Adding luscious cream frosting...");
      sound.playClick();
    }, 1800);

    const timer3 = setTimeout(() => {
      setBuildStep(3);
      setStatusText("Sprinkling sweet confetti...");
      sound.playSparkle();
    }, 2800);

    const timer4 = setTimeout(() => {
      setBuildStep(4);
      setStatusText("Placing the birthday candle...");
      sound.playClick();
    }, 3800);

    const timer5 = setTimeout(() => {
      setBuildStep(5);
      setStatusText(`Happy Birthday, ${recipientName || 'Birthday Star'}!`);
      sound.playSparkle();
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [recipientName]);

  const handleBlowCandles = () => {
    if (candlesBlown || buildStep < 5) return;
    setCandlesBlown(true);
    sound.playCandleBlow();
    sound.playFanfare();
    fireCelebrationConfetti();
    fireFireworksSequence(5000);
  };

  const handleSkipBuild = () => {
    setBuildStep(5);
    setStatusText(`Happy Birthday, ${recipientName || 'Birthday Star'}!`);
    sound.playSparkle();
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-6 z-10 relative">
      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <span className="font-serif text-lg sm:text-xl text-[#FFBFA8] font-bold tracking-wide flex items-center justify-center gap-2">
          <span>First things first</span>
          <span>🎂</span>
        </span>
      </motion.div>

      {/* Main Heading / Status */}
      <div className="min-h-[3rem] mb-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={statusText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,191,168,0.4)]"
          >
            {statusText}
          </motion.h2>
        </AnimatePresence>
        <p className="text-xs sm:text-sm text-[#FFD166] mt-1 font-medium">
          {buildStep < 5
            ? "Watch your cake being freshly made..."
            : candlesBlown
            ? "✨ Wish sent to the universe! ✨"
            : "Make a wish & touch the cake to blow out the candle 🕯️"}
        </p>
      </div>

      {/* Interactive Birthday Cake Construction Canvas */}
      <div
        onClick={handleBlowCandles}
        className="relative w-80 sm:w-96 h-80 mx-auto flex flex-col items-center justify-end pb-8 cursor-pointer group select-none"
        title={buildStep >= 5 && !candlesBlown ? "Tap to blow candle!" : ""}
      >
        {/* Glowing background warm aura */}
        <div className="absolute inset-0 bg-radial from-[#FFBFA8]/20 via-[#E85B32]/10 to-transparent blur-3xl pointer-events-none" />

        {/* 1. Cake Plate (Always present or slides in) */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-72 sm:w-84 h-4 rounded-full bg-gradient-to-r from-[#F0E6D8] via-white to-[#F0E6D8] shadow-2xl border border-white/80 z-10"
        />

        {/* 2. Cake Sponge Body (Assembles at buildStep >= 1) */}
        <AnimatePresence>
          {buildStep >= 1 && (
            <motion.div
              initial={{ y: -50, opacity: 0, scaleY: 0.5 }}
              animate={{ y: 0, opacity: 1, scaleY: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute bottom-11 w-64 sm:w-72 h-36 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between z-20 border-2 border-[#382015]/60"
              style={{
                background: 'linear-gradient(to right, #402318 0%, #573324 40%, #683E2D 70%, #402318 100%)'
              }}
            >
              {/* Chocolate Sponge Layer 1 */}
              <div className="h-10 w-full relative">
                {/* Crumb texture accents */}
                <div className="absolute top-2 left-6 w-2 h-1 bg-[#2C1810]/50 rounded-full" />
                <div className="absolute top-4 right-10 w-3 h-1 bg-[#2C1810]/50 rounded-full" />
              </div>

              {/* Cream Filling Layer 1 */}
              <div className="h-2.5 w-full bg-[#FFF5E6] shadow-inner flex items-center justify-around px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
              </div>

              {/* Chocolate Sponge Layer 2 */}
              <div className="h-10 w-full relative">
                <div className="absolute top-3 left-16 w-3 h-1 bg-[#2C1810]/50 rounded-full" />
                <div className="absolute top-5 right-20 w-2 h-1 bg-[#2C1810]/50 rounded-full" />
              </div>

              {/* Cream Filling Layer 2 */}
              <div className="h-2.5 w-full bg-[#FFF5E6] shadow-inner flex items-center justify-around px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBFA8]" />
              </div>

              {/* Chocolate Sponge Base Layer 3 */}
              <div className="h-9 w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Luscious Cream Frosting with Drips (buildStep >= 2) */}
        <AnimatePresence>
          {buildStep >= 2 && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute bottom-[8.5rem] w-66 sm:w-74 h-16 z-30 pointer-events-none"
            >
              {/* SVG Smooth Frosting Drips matching reference video */}
              <svg viewBox="0 0 280 60" className="w-full h-full drop-shadow-md">
                <defs>
                  <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FFF0E6" />
                  </linearGradient>
                </defs>
                {/* Organic cream drip paths */}
                <path
                  d="M 5,10 
                     C 20,10 20,45 35,45 
                     C 50,45 50,15 65,15 
                     C 75,15 80,55 95,55 
                     C 110,55 115,18 130,18 
                     C 145,18 150,48 165,48 
                     C 180,48 185,15 200,15 
                     C 215,15 220,52 235,52 
                     C 250,52 255,10 275,10 
                     L 275,0 L 5,0 Z"
                  fill="url(#frostingGrad)"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Candy Sprinkles & Confetti (buildStep >= 3) */}
        <AnimatePresence>
          {buildStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-[9.5rem] w-56 h-8 z-35 flex items-center justify-around pointer-events-none px-4"
            >
              <span className="w-2.5 h-1.5 rounded-full bg-[#FF4081] rotate-12 shadow-xs" />
              <span className="w-2 h-2 rounded-full bg-[#FFD166] shadow-xs" />
              <span className="w-3 h-1.5 rounded-full bg-[#06D6A0] -rotate-45 shadow-xs" />
              <span className="w-2.5 h-1.5 rounded-full bg-[#48CAE4] rotate-30 shadow-xs" />
              <span className="w-2 h-2 rounded-full bg-[#FF6B8B] shadow-xs" />
              <span className="w-3 h-1.5 rounded-full bg-[#FFD166] rotate-6 shadow-xs" />
              <span className="w-2.5 h-1.5 rounded-full bg-[#B388FF] -rotate-12 shadow-xs" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Birthday Candle & Flickering Flame (buildStep >= 4) */}
        <AnimatePresence>
          {buildStep >= 4 && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute bottom-[10.5rem] flex flex-col items-center z-40"
            >
              {/* Flame (Ignites at buildStep >= 5) */}
              {buildStep >= 5 && (
                <div className="relative mb-0.5">
                  {!candlesBlown ? (
                    <motion.div
                      animate={{
                        scaleY: [1, 1.25, 0.9, 1.2, 1],
                        scaleX: [1, 0.85, 1.15, 0.9, 1],
                        opacity: [0.9, 1, 0.85, 1, 0.9]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-4 h-7 rounded-full bg-gradient-to-t from-amber-500 via-orange-300 to-yellow-100 shadow-[0_0_25px_#FFD166]"
                    >
                      {/* Inner bright core */}
                      <div className="w-1.5 h-3 bg-white rounded-full mx-auto mt-2 blur-[0.5px]" />
                    </motion.div>
                  ) : (
                    /* Smoke puff when blown */
                    <motion.div
                      initial={{ y: 0, opacity: 0.9, scale: 0.8 }}
                      animate={{ y: -30, opacity: 0, scale: 2 }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="w-3 h-5 text-xs text-gray-300 font-mono"
                    >
                      ~
                    </motion.div>
                  )}
                </div>
              )}

              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-gray-700" />

              {/* Candle Stick */}
              <div className="w-4 h-12 rounded-t-sm bg-gradient-to-r from-white via-rose-100 to-rose-200 border border-white/60 shadow-md relative overflow-hidden">
                {/* Spiral stripes */}
                <div className="w-full h-1.5 bg-[#FF6B8B]/40 my-1 rotate-12" />
                <div className="w-full h-1.5 bg-[#FF6B8B]/40 my-1 rotate-12" />
                <div className="w-full h-1.5 bg-[#FF6B8B]/40 my-1 rotate-12" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Build Button if animating */}
      {buildStep < 5 && (
        <button
          onClick={handleSkipBuild}
          className="text-xs text-white/50 hover:text-white underline transition-colors cursor-pointer mb-4"
        >
          Skip animation & light candle
        </button>
      )}

      {/* Prompt below cake */}
      {buildStep >= 5 && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#FFD166] text-xs font-bold shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {candlesBlown
                ? "✨ Candle blown! Ready to pop your balloons ✨"
                : "Touch Cake to Blow Candle & Make Your Wish!"}
            </span>
          </span>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-xl mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Reveal</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-sm font-bold shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Pop Balloons 🎈</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
