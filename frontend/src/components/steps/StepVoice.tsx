import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Mic } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { VoiceRecorder } from '../voice/VoiceRecorder';

export const StepVoice: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useBirthday();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1.5 text-sm font-medium text-[#38251F]/70 hover:text-[#E85B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Letter</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 5 of 7</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-[71%] h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Voice Recorder Component */}
      <VoiceRecorder
        initialVoice={formData.voice_message}
        senderName={formData.sender_name}
        recipientName={formData.recipient_name}
        onVoiceChange={(voice) => updateFormData({ voice_message: voice })}
      />

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between mt-8 max-w-2xl mx-auto pt-4 border-t border-[#FFBFA8]/40">
        <button
          type="button"
          onClick={nextStep}
          className="text-xs text-[#38251F]/60 hover:text-[#38251F] underline cursor-pointer"
        >
          {formData.voice_message?.audio_url ? "Skip replacing voice note" : "Skip voice recording for now"}
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-sm font-bold shadow-lg shadow-[#E85B32]/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Theme Studio 🎨</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
