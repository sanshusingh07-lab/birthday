import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Petal {
  id: number;
  xStart: number;
  size: number;
  duration: number;
  delay: number;
  rotateZ: number;
  color: string;
  type: 'sakura' | 'rose' | 'leaf';
}

export const FlowerPetals: React.FC<{ count?: number }> = ({ count = 28 }) => {
  const petals: Petal[] = useMemo(() => {
    const colors = [
      'rgba(255, 182, 193, 0.85)', // soft light pink
      'rgba(255, 140, 165, 0.85)', // rose pink
      'rgba(255, 192, 203, 0.75)', // pastel pink
      'rgba(247, 166, 160, 0.85)', // peach petal
      'rgba(255, 223, 186, 0.75)', // warm cream petal
      'rgba(255, 105, 180, 0.7)',  // hot pink
      'rgba(254, 205, 211, 0.8)'   // blush
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      xStart: Math.random() * 100, // percentage 0 - 100%
      size: 14 + Math.random() * 18, // 14px to 32px
      duration: 7 + Math.random() * 7, // 7s to 14s fall time
      delay: Math.random() * 6, // staggered start
      rotateZ: Math.random() * 360,
      color: colors[i % colors.length],
      type: i % 7 === 0 ? 'leaf' : i % 2 === 0 ? 'rose' : 'sakura'
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            y: -60,
            x: `${petal.xStart}vw`,
            opacity: 0,
            rotate: petal.rotateZ,
            scale: 0.7
          }}
          animate={{
            y: '108vh',
            x: [
              `${petal.xStart}vw`,
              `${petal.xStart + (petal.id % 2 === 0 ? 6 : -6)}vw`,
              `${petal.xStart + (petal.id % 2 === 0 ? -4 : 8)}vw`,
              `${petal.xStart}vw`
            ],
            opacity: [0, 0.95, 0.95, 0.2, 0],
            rotate: [petal.rotateZ, petal.rotateZ + 180, petal.rotateZ + 360],
            scale: [0.7, 1, 0.9, 0.7]
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{ width: petal.size, height: petal.size }}
        >
          {/* Flower Petal SVG */}
          {petal.type === 'sakura' ? (
            <svg viewBox="0 0 30 30" className="w-full h-full drop-shadow-sm filter">
              {/* Sakura notched petal */}
              <path
                d="M15,2 C18,7 26,10 26,17 C26,24 20,28 15,28 C10,28 4,24 4,17 C4,10 12,7 15,2 Z"
                fill={petal.color}
              />
              <path
                d="M15,28 C15,22 15,16 15,10"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="0.8"
                fill="none"
              />
            </svg>
          ) : petal.type === 'rose' ? (
            <svg viewBox="0 0 30 30" className="w-full h-full drop-shadow-sm filter">
              {/* Rounded curved rose petal */}
              <path
                d="M15,3 C23,3 28,11 27,20 C26,27 19,28 15,28 C11,28 4,27 3,20 C2,11 7,3 15,3 Z"
                fill={petal.color}
              />
              <ellipse
                cx="15"
                cy="14"
                rx="6"
                ry="10"
                fill="rgba(255, 255, 255, 0.2)"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 30 30" className="w-full h-full drop-shadow-sm filter">
              {/* Tender green/gold leaf */}
              <path
                d="M15,2 C25,7 28,20 15,28 C2,20 5,7 15,2 Z"
                fill="rgba(163, 209, 157, 0.7)"
              />
              <line
                x1="15"
                y1="3"
                x2="15"
                y2="27"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="0.8"
              />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};
