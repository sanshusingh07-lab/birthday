import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Maximize2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { MemoryItem } from '../../types/birthday';
import { sound } from '../../utils/audio';

interface SceneGalleryProps {
  memories: MemoryItem[];
  recipientName: string;
  onNext: () => void;
  onPrev: () => void;
}

export const SceneGallery: React.FC<SceneGalleryProps> = ({
  memories,
  recipientName,
  onNext,
  onPrev
}) => {
  const [selectedImage, setSelectedImage] = useState<MemoryItem | null>(null);

  const handleOpenPhoto = (m: MemoryItem) => {
    sound.playSparkle();
    setSelectedImage(m);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 z-10 relative text-center">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#FFD166] mb-3 backdrop-blur-sm">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Step 5: Memory Gallery</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">
          Cherished Moments 📸
        </h2>
        <p className="text-sm text-[#FFBFA8] max-w-md mx-auto">
          Snapshots of the laughter, milestones, and adventures shared with {recipientName || 'you'}.
        </p>
      </motion.div>

      {/* Polaroid Gallery Grid */}
      {memories && memories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mb-10">
          {memories.map((item, index) => {
            const rotation = (index % 4 === 0 ? -3 : index % 4 === 1 ? 3 : index % 4 === 2 ? -2 : 2);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 0, y: -8 }}
                onClick={() => handleOpenPhoto(item)}
                className="relative p-4 pb-6 bg-white rounded-2xl shadow-2xl cursor-pointer group select-none text-left"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Tape Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/70 border border-amber-200/50 backdrop-blur-xs rounded-xs rotate-1 shadow-xs" />

                {/* Photo Image */}
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={item.image_url}
                    alt={item.caption || "Memory"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-2.5 rounded-full bg-white/90 text-[#38251F] shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Caption */}
                <p className="font-handwriting text-xl sm:text-2xl text-[#38251F] text-center min-h-[2rem] px-2 leading-tight">
                  {item.caption || "A moment to remember ✨"}
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/10 border border-white/20 text-center max-w-md mx-auto mb-10">
          <p className="text-base text-[#FFBFA8] mb-2 font-serif">
            "The best memories are the ones written in our hearts."
          </p>
          <span className="text-xs text-white/60">Every moment with you is a treasure.</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Letter</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-sm font-bold shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Grand Finale 🎆</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full p-4 sm:p-6 bg-white rounded-3xl shadow-2xl text-center"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-2xl overflow-hidden max-h-[70vh] bg-black/5 mb-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption || "Expanded memory"}
                  className="w-full h-full object-contain mx-auto"
                />
              </div>

              {selectedImage.caption && (
                <p className="font-handwriting text-2xl sm:text-3xl text-[#38251F] px-4">
                  "{selectedImage.caption}"
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
