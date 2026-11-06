import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { ThemeStudio } from '../theme/ThemeStudio';

export const StepTheme: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useBirthday();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1.5 text-sm font-medium text-[#38251F]/70 hover:text-[#E85B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Voice Note</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 6 of 7</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Theme Studio Component */}
      <ThemeStudio
        currentTheme={formData.custom_theme}
        recipientName={formData.recipient_name}
        senderName={formData.sender_name}
        onThemeChange={(theme) => updateFormData({ custom_theme: theme })}
      />

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between mt-8 max-w-6xl mx-auto pt-6 border-t border-[#FFBFA8]/40">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2.5 rounded-xl border border-[#FFBFA8] text-xs font-semibold text-[#38251F] cursor-pointer hover:bg-white"
        >
          Previous Step
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-sm font-bold shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Final Review ✨</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

