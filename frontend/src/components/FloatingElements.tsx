import React from 'react';
import { motion } from 'framer-motion';

export const FloatingElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft gradient background glow orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#FFBFA8]/25 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-[#F7A6A0]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFF0E6] rounded-full blur-2xl" />

      {/* Floating Heart 1 */}
      <motion.div
        animate={{
          y: [-10, 15, -10],
          rotate: [-6, 6, -6],
          x: [-5, 10, -5]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-[8%] text-2xl text-[#E85B32]/40 select-none"
      >
        💖
      </motion.div>

      {/* Floating Star 1 */}
      <motion.div
        animate={{
          y: [15, -12, 15],
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 45, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[12%] text-xl text-[#F7A6A0]/60 select-none"
      >
        ✨
      </motion.div>

      {/* Floating Balloon */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [-10, 10, -10],
          rotate: [-4, 5, -4]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 left-[12%] text-3xl opacity-40 select-none"
      >
        🎈
      </motion.div>

      {/* Floating Heart 2 */}
      <motion.div
        animate={{
          y: [20, -15, 20],
          rotate: [8, -8, 8]
        }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-[15%] text-2xl text-[#E85B32]/35 select-none"
      >
        🌸
      </motion.div>

      {/* Floating Sparkle */}
      <motion.div
        animate={{
          scale: [0.7, 1.3, 0.7],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[4%] text-lg text-[#E85B32]/50 select-none"
      >
        ⭐
      </motion.div>
    </div>
  );
};

