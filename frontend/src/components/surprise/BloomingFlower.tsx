import React from 'react';
import { motion } from 'framer-motion';

export const BloomingFlower: React.FC<{ size?: number }> = ({ size = 120 }) => {
  // 8 outer petals at 45 degree intervals
  const outerPetals = [0, 45, 90, 135, 180, 225, 270, 315];
  // 8 inner petals offset by 22.5 degrees
  const innerPetals = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none select-none mx-auto my-2"
      style={{ width: size, height: size }}
    >
      {/* Background Soft Bloom Radiant Halo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          duration: 1.2
        }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.6) 0%, rgba(232, 91, 50, 0.3) 50%, transparent 70%)'
        }}
      />

      {/* SVG Blooming Flower Structure */}
      <svg
        viewBox="-60 -60 120 120"
        className="w-full h-full overflow-visible filter drop-shadow-[0_8px_20px_rgba(255,105,180,0.45)]"
      >
        <defs>
          {/* Outer Petal Gradient */}
          <linearGradient id="outerPetalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF0F5" />
            <stop offset="40%" stopColor="#FFAFCC" />
            <stop offset="100%" stopColor="#E85B32" />
          </linearGradient>

          {/* Inner Petal Gradient */}
          <linearGradient id="innerPetalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="50%" stopColor="#FF80AB" />
            <stop offset="100%" stopColor="#FF4081" />
          </linearGradient>

          {/* Core Golden Stardust Gradient */}
          <radialGradient id="coreGoldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFE066" />
            <stop offset="85%" stopColor="#F77F00" />
            <stop offset="100%" stopColor="#D62828" />
          </radialGradient>
        </defs>

        {/* 1. Outer Petal Ring (Blooms First) */}
        {outerPetals.map((angle, index) => (
          <motion.g
            key={`outer-${angle}`}
            initial={{ scale: 0, opacity: 0, rotate: angle - 30 }}
            animate={{ scale: 1, opacity: 1, rotate: angle }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 12,
              delay: 0.15 + index * 0.05
            }}
          >
            <path
              d="M 0,-48 C 14,-32 18,-12 0,0 C -18,-12 -14,-32 0,-48 Z"
              fill="url(#outerPetalGrad)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.8"
            />
          </motion.g>
        ))}

        {/* 2. Inner Petal Ring (Blooms Second) */}
        {innerPetals.map((angle, index) => (
          <motion.g
            key={`inner-${angle}`}
            initial={{ scale: 0, opacity: 0, rotate: angle + 25 }}
            animate={{ scale: 0.85, opacity: 1, rotate: angle }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 14,
              delay: 0.45 + index * 0.04
            }}
          >
            <path
              d="M 0,-38 C 11,-24 14,-10 0,0 C -14,-10 -11,-24 0,-38 Z"
              fill="url(#innerPetalGrad)"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="0.8"
            />
          </motion.g>
        ))}

        {/* 3. Center Golden Pistils & Stamen Dots */}
        <motion.circle
          cx="0"
          cy="0"
          r="12"
          fill="url(#coreGoldGrad)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 220 }}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1.2"
        />

        {/* Pistil details */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <motion.circle
            key={`dot-${deg}`}
            cx={7 * Math.cos((deg * Math.PI) / 180)}
            cy={7 * Math.sin((deg * Math.PI) / 180)}
            r="1.8"
            fill="#FFF"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.25, 1] }}
            transition={{
              delay: 0.9 + deg * 0.001,
              repeat: Infinity,
              duration: 2
            }}
          />
        ))}
      </svg>
    </div>
  );
};

