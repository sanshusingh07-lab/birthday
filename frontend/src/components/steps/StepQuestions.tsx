import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { useBirthday, DEFAULT_QUESTIONS } from '../../context/BirthdayContext';
import { sound } from '../../utils/audio';

export const StepQuestions: React.FC = () => {
  const { formData, updateWish, nextStep, prevStep } = useBirthday();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const filledCount = formData.wishes.filter(w => w.answer && w.answer.trim().length > 0).length;
  const totalCount = DEFAULT_QUESTIONS.length;

  const handleSelectSuggestion = (index: number, suggestion: string) => {
    sound.playSparkle();
    updateWish(index, suggestion);
  };

  const handleNext = () => {
    sound.playSparkle();
    nextStep();
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
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 2 of 5</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-2/5 h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Title & Balloon Tracker */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFBFA8]/30 border border-[#FFBFA8] text-xs font-semibold text-[#E85B32] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Surprise Balloons</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#38251F]">
          Fill the Balloons 🎈
        </h2>
        <p className="text-sm text-[#38251F]/70 mt-1 max-w-md mx-auto">
          Every memory and wish you enter will be tucked inside a magical balloon for {formData.recipient_name || 'them'} to pop!
        </p>

        {/* Floating Balloon Progress Row */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {DEFAULT_QUESTIONS.map((_, i) => {
            const isFilled = formData.wishes[i]?.answer?.trim().length > 0;
            const isSelected = activeQuestionIndex === i;
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveQuestionIndex(i);
                }}
                animate={{
                  scale: isSelected ? 1.25 : 1,
                  y: isFilled ? [-3, 3, -3] : 0
                }}
                transition={{
                  y: { repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" }
                }}
                className={`relative w-11 h-14 rounded-t-full rounded-b-xl flex flex-col items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white shadow-lg shadow-[#E85B32]/30'
                    : 'bg-[#FFBFA8]/40 border border-[#FFBFA8] text-[#38251F]/50'
                }`}
                title={`Question ${i + 1}`}
              >
                <span className="text-xs font-bold">{i + 1}</span>
                {/* Balloon knot string */}
                <span className="w-0.5 h-3 bg-gray-400 absolute -bottom-3" />
                {isFilled && (
                  <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 text-emerald-400 fill-white" />
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-[#E85B32] mt-4">
          {filledCount} of {totalCount} balloons filled with love
        </p>
      </div>

      {/* Question Cards Carousel / List */}
      <div className="space-y-6">
        {DEFAULT_QUESTIONS.map((qObj, index) => {
          const currentAnswer = formData.wishes[index]?.answer || '';
          const isFilled = currentAnswer.trim().length > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`p-6 sm:p-8 rounded-3xl transition-all border ${
                activeQuestionIndex === index
                  ? 'bg-white shadow-xl shadow-[#E85B32]/10 border-[#E85B32]'
                  : 'bg-white/80 border-[#FFBFA8]/60 shadow-xs hover:border-[#E85B32]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-serif ${
                    isFilled ? 'bg-[#E85B32] text-white' : 'bg-[#FFBFA8]/40 text-[#E85B32]'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#38251F]">
                    {qObj.question}
                  </h3>
                </div>

                {isFilled && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              {/* Selectable Suggestions */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Select a suggestion or write your own:
                </p>
                <div className="flex flex-wrap gap-2">
                  {qObj.suggestions.map((suggestion, sIdx) => {
                    const isSelected = currentAnswer === suggestion;
                    return (
                      <button
                        type="button"
                        key={sIdx}
                        onClick={() => handleSelectSuggestion(index, suggestion)}
                        className={`text-xs px-3 py-1.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#E85B32] text-white border-[#E85B32] shadow-xs'
                            : 'bg-[#FFF6F0]/80 text-[#38251F] border-[#FFBFA8]/60 hover:bg-white hover:border-[#E85B32]'
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Answer Input */}
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder={`Write your personal answer for ${formData.recipient_name || 'them'}...`}
                  value={currentAnswer}
                  onFocus={() => setActiveQuestionIndex(index)}
                  onChange={e => updateWish(index, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF6F0]/50 border border-[#FFBFA8] text-sm text-[#38251F] outline-none focus:border-[#E85B32] focus:ring-2 focus:ring-[#FFBFA8]/40 transition-all resize-none"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-3.5 rounded-2xl bg-white border border-[#FFBFA8] text-[#38251F] font-semibold text-sm hover:bg-[#FFF6F0] transition-all"
        >
          Previous Step
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-semibold text-sm shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
        >
          <span>Continue to Photo Memories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

