import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, UploadCloud, Trash2, Image as ImageIcon, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { uploadTempPhoto } from '../../utils/api';
import { sound } from '../../utils/audio';

const SAMPLE_PHOTOS = [
  {
    image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    caption: "The unforgettable sunset cliffside picnic"
  },
  {
    image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    caption: "Laughing uncontrollably over iced coffees"
  },
  {
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    caption: "Dancing like nobody was watching!"
  }
];

export const StepMemories: React.FC = () => {
  const { formData, addMemory, removeMemory, updateMemoryCaption, nextStep, prevStep } = useBirthday();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setUploadError("Please upload image files only (PNG, JPG, WEBP).");
          continue;
        }

        // Upload to server or use object URL
        try {
          const uploadedUrl = await uploadTempPhoto(file);
          addMemory({
            image_url: uploadedUrl,
            caption: ""
          });
          sound.playSparkle();
        } catch (e) {
          // Fallback to local object URL if backend fails
          const objectUrl = URL.createObjectURL(file);
          addMemory({
            image_url: objectUrl,
            caption: ""
          });
          sound.playSparkle();
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddSamplePhotos = () => {
    sound.playSparkle();
    SAMPLE_PHOTOS.forEach(photo => {
      addMemory(photo);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header and Step Progress */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1.5 text-sm font-medium text-[#38251F]/70 hover:text-[#E85B32] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 3 of 7</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-[43%] h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFBFA8]/30 border border-[#FFBFA8] text-xs font-semibold text-[#E85B32] mb-3">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Polaroid Memory Gallery</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#38251F]">
          Hang Up Some Memories 📸
        </h2>
        <p className="text-sm text-[#38251F]/70 mt-1 max-w-md mx-auto">
          Upload cherished photographs to be hung on a magical animated clothesline during their birthday surprise.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer mb-8 ${
          isDragging
            ? 'border-[#E85B32] bg-[#FFBFA8]/30 scale-101'
            : 'border-[#FFBFA8] bg-white/70 hover:bg-white hover:border-[#E85B32]/70 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFBFA8]/40 text-[#E85B32] flex items-center justify-center shadow-md">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#38251F]">
          {isUploading ? "Uploading photographs..." : "Drag & drop photos here, or click to browse"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Supports JPG, PNG, WEBP, GIF. You can upload multiple photos!
        </p>

        {/* Quick Add Demo Photos */}
        <div className="mt-4 pt-4 border-t border-[#FFBFA8]/40">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleAddSamplePhotos();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF6F0] hover:bg-[#FFBFA8]/40 text-[#E85B32] text-xs font-semibold border border-[#FFBFA8] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add 3 Beautiful Sample Photos</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Polaroid Gallery Grid */}
      {formData.memories.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg text-[#38251F]">
              Uploaded Memories ({formData.memories.length})
            </h3>
            <span className="text-xs text-gray-500">
              Click caption to add a sweet note
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {formData.memories.map((mem, index) => {
                const rotation = (index % 3 === 0 ? -2 : index % 3 === 1 ? 2 : -1);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative p-3 pb-5 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col group"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        removeMemory(index);
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all opacity-80 group-hover:opacity-100 z-10"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-4/3 rounded-sm overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={mem.image_url}
                        alt="Memory preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Caption input */}
                    <input
                      type="text"
                      placeholder="Add a sweet caption..."
                      value={mem.caption || ''}
                      onChange={e => updateMemoryCaption(index, e.target.value)}
                      className="w-full text-center text-xs text-[#38251F] font-handwriting text-base border-b border-gray-200 focus:border-[#E85B32] outline-none py-1 bg-transparent placeholder:font-sans placeholder:text-xs placeholder:text-gray-400"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Info Notice: Optional upload */}
      <div className="p-4 rounded-2xl bg-white/60 border border-[#FFBFA8]/50 text-center text-xs text-[#38251F]/80 mb-8">
        ✨ <span className="font-semibold">Tip:</span> Photos add warmth to the surprise, but you can also continue without uploading photos if you prefer!
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-3.5 rounded-2xl bg-white border border-[#FFBFA8] text-[#38251F] font-semibold text-sm hover:bg-[#FFF6F0] transition-all"
        >
          Previous Step
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            nextStep();
          }}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-semibold text-sm shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
        >
          <span>Continue to Birthday Letter</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

