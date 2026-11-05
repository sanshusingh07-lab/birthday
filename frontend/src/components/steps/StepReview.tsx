import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Edit3, Image as ImageIcon, Mail, Gift, Music, Play, Pause } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { sound, MUSIC_TRACKS, MusicTrackId } from '../../utils/audio';

export const StepReview: React.FC = () => {
  const {
    formData,
    goToStep,
    prevStep,
    submitSurprise,
    isLoadingMagic,
    magicLoadingStep,
    error,
    selectedTrack,
    changeTrack,
    audioPlaying,
    toggleMusic
  } = useBirthday();

  const handleCreateMagic = async () => {
    sound.playFanfare();
    try {
      await submitSurprise();
    } catch (e) {
      // error is handled in context
    }
  };

  const handlePreviewTrack = (trackId: MusicTrackId) => {
    changeTrack(trackId);
    if (!audioPlaying) {
      toggleMusic();
    }
  };

  const filledWishes = formData.wishes.filter(w => w.answer && w.answer.trim().length > 0);

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
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 5 of 5</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-full h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFBFA8]/30 border border-[#FFBFA8] text-xs font-semibold text-[#E85B32] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Almost There</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#38251F]">
          Review Your Birthday Surprise ✨
        </h2>
        <p className="text-sm text-[#38251F]/70 mt-1 max-w-md mx-auto">
          Take a look at what you created and choose the background music before we weave it into a magical experience.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-6 mb-10">
        {/* 1. Recipient & Sender Card */}
        <div className="p-6 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xs relative">
          <button
            onClick={() => goToStep(2)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FFBFA8]/30 text-[#E85B32] transition-colors"
            title="Edit Information"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E85B32] mb-3 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> The Birthday Star
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Recipient</p>
              <p className="font-serif font-bold text-lg text-[#38251F]">{formData.recipient_name || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">From</p>
              <p className="font-serif font-bold text-lg text-[#38251F]">{formData.sender_name || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Relationship</p>
              <p className="font-semibold text-sm text-[#38251F]">{formData.relationship || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Celebration</p>
              <p className="font-semibold text-sm text-[#38251F]">{formData.celebration_date || 'Today'}</p>
            </div>
          </div>
        </div>

        {/* 2. Background Music Selection */}
        <div className="p-6 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xs relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E85B32] flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Choose Background Music
            </h3>
            <button
              onClick={toggleMusic}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFBFA8]/30 hover:bg-[#FFBFA8]/50 text-[#E85B32] transition-colors flex items-center gap-1"
            >
              {audioPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{audioPlaying ? "Pause Preview" : "Listen Preview"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MUSIC_TRACKS.map(t => {
              const isSelected = selectedTrack === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handlePreviewTrack(t.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FFF0E6] to-white border-[#E85B32] shadow-md ring-2 ring-[#E85B32]/30'
                      : 'bg-[#FFF6F0]/40 border-[#FFBFA8]/50 hover:bg-white'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isSelected ? 'text-[#E85B32]' : 'text-[#38251F]'}`}>
                      {t.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{t.description}</p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-bold text-[#E85B32] bg-[#FFBFA8]/40 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Balloon Questions Card */}
        <div className="p-6 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xs relative">
          <button
            onClick={() => goToStep(3)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FFBFA8]/30 text-[#E85B32] transition-colors"
            title="Edit Balloon Questions"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E85B32] mb-3 flex items-center gap-1.5">
            🎈 Balloon Wishes & Answers ({filledWishes.length})
          </h3>

          <div className="space-y-3">
            {filledWishes.map((w, idx) => (
              <div key={idx} className="p-3 bg-[#FFF6F0]/60 rounded-xl border border-[#FFBFA8]/30 text-xs">
                <span className="font-semibold text-[#38251F] block mb-1">
                  Q: {w.question}
                </span>
                <span className="text-[#38251F]/80 italic">
                  "{w.answer}"
                </span>
              </div>
            ))}
            {filledWishes.length === 0 && (
              <p className="text-xs text-gray-400 italic">No balloon answers provided.</p>
            )}
          </div>
        </div>

        {/* 4. Memory Photographs Card */}
        <div className="p-6 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xs relative">
          <button
            onClick={() => goToStep(4)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FFBFA8]/30 text-[#E85B32] transition-colors"
            title="Edit Photos"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E85B32] mb-3 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" /> Polaroid Memories ({formData.memories.length})
          </h3>

          {formData.memories.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.memories.map((m, idx) => (
                <div key={idx} className="p-1.5 bg-white rounded-lg shadow-xs border border-gray-100 text-center">
                  <img src={m.image_url} alt="Memory" className="w-full h-16 object-cover rounded-xs" />
                  <p className="text-[10px] text-gray-500 font-handwriting mt-1 truncate">
                    {m.caption || 'Memory'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No photos uploaded. (The surprise still works beautifully!)</p>
          )}
        </div>

        {/* 5. Birthday Letter Card */}
        <div className="p-6 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xs relative">
          <button
            onClick={() => goToStep(5)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FFBFA8]/30 text-[#E85B32] transition-colors"
            title="Edit Letter"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E85B32] mb-3 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Personalized Birthday Letter
          </h3>

          <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E8D8C8] font-serif text-xs text-[#38251F]/90 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {formData.birthday_letter || 'No letter written yet.'}
          </div>
        </div>
      </div>

      {/* Prominent CTA: Create The Magic ✨ */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleCreateMagic}
          className="w-full sm:w-auto px-12 py-5 rounded-3xl bg-gradient-to-r from-[#E85B32] via-[#FF6B8B] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-bold text-lg sm:text-xl shadow-2xl shadow-[#E85B32]/40 hover:shadow-[#E85B32]/60 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer group"
        >
          <Sparkles className="w-6 h-6 animate-spin-slow" />
          <span>Create The Magic ✨</span>
        </button>
        <p className="text-xs text-[#38251F]/60 mt-3">
          Generates your personalized surprise with animated balloons, birthday cake, letter & music!
        </p>
      </div>

      {/* Multi-Step Magical Loading Modal */}
      <AnimatePresence>
        {isLoadingMagic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#170D2D]/90 backdrop-blur-md text-white text-center"
          >
            <div className="max-w-md w-full p-8 rounded-3xl bg-white/10 border border-white/20 shadow-2xl">
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-5, 5, -5],
                  scale: [1, 1.08, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-[#E85B32] to-[#F7A6A0] flex items-center justify-center shadow-2xl shadow-[#E85B32]/50 text-white"
              >
                <Sparkles className="w-10 h-10 animate-spin-slow" />
              </motion.div>

              <h3 className="font-serif text-2xl font-bold mb-2 text-white">
                Weaving The Magic
              </h3>
              <p className="text-base text-[#FFBFA8] font-medium min-h-[1.75rem] transition-all">
                {magicLoadingStep}
              </p>

              <div className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden relative">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#FFBFA8] to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
