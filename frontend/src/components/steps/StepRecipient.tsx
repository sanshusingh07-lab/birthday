import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Sparkles, Calendar, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { sound } from '../../utils/audio';

const RELATIONSHIPS = [
  { label: 'Friend', emoji: '🤝' },
  { label: 'Best Friend', emoji: '✨' },
  { label: 'Partner', emoji: '❤️' },
  { label: 'Sister', emoji: '🌸' },
  { label: 'Brother', emoji: '⚡' },
  { label: 'Mother', emoji: '🌷' },
  { label: 'Father', emoji: '🌟' },
  { label: 'Other', emoji: '🎁' },
];

export const StepRecipient: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useBirthday();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = "Please enter the birthday person's name";
    }
    if (!formData.sender_name.trim()) {
      newErrors.sender_name = "Please enter your name";
    }
    if (!formData.relationship.trim()) {
      newErrors.relationship = "Please select your relationship";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      sound.playSparkle();
      nextStep();
    } else {
      sound.playClick();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator Header */}
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
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 1 of 7</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-[14%] h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-10 rounded-3xl bg-white/90 border border-[#FFBFA8]/70 shadow-xl shadow-[#E85B32]/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFBFA8]/40 text-[#E85B32] flex items-center justify-center font-bold text-xl font-serif">
            1
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#38251F]">
              Who's the Birthday Star?
            </h2>
            <p className="text-sm text-[#38251F]/70">
              Tell us who we are celebrating today!
            </p>
          </div>
        </div>

        <form onSubmit={handleContinue} className="mt-8 space-y-6">
          {/* Recipient Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#38251F] mb-2">
              Birthday Person's Name <span className="text-[#E85B32]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Maya, David, Mom"
                value={formData.recipient_name}
                onChange={e => {
                  updateFormData({ recipient_name: e.target.value });
                  if (errors.recipient_name) setErrors(prev => ({ ...prev, recipient_name: '' }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl bg-[#FFF6F0]/50 border text-base text-[#38251F] outline-none transition-all ${
                  errors.recipient_name
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-[#FFBFA8] focus:border-[#E85B32] focus:ring-2 focus:ring-[#FFBFA8]/40'
                }`}
              />
              <Sparkles className="w-5 h-5 text-[#FFBFA8] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.recipient_name && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.recipient_name}</span>
              </p>
            )}
          </div>

          {/* Sender Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#38251F] mb-2">
              Your Name (The Sender) <span className="text-[#E85B32]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Alex, Sarah, Your Favorite Kid"
                value={formData.sender_name}
                onChange={e => {
                  updateFormData({ sender_name: e.target.value });
                  if (errors.sender_name) setErrors(prev => ({ ...prev, sender_name: '' }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl bg-[#FFF6F0]/50 border text-base text-[#38251F] outline-none transition-all ${
                  errors.sender_name
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-[#FFBFA8] focus:border-[#E85B32] focus:ring-2 focus:ring-[#FFBFA8]/40'
                }`}
              />
              <User className="w-5 h-5 text-[#FFBFA8] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.sender_name && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.sender_name}</span>
              </p>
            )}
          </div>

          {/* Relationship Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#38251F] mb-2">
              Your Relationship <span className="text-[#E85B32]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {RELATIONSHIPS.map(rel => {
                const isSelected = formData.relationship === rel.label;
                return (
                  <button
                    type="button"
                    key={rel.label}
                    onClick={() => {
                      sound.playClick();
                      updateFormData({ relationship: rel.label });
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-[#E85B32] text-white border-[#E85B32] shadow-md shadow-[#E85B32]/25 scale-102'
                        : 'bg-[#FFF6F0]/70 text-[#38251F] border-[#FFBFA8]/60 hover:bg-white hover:border-[#E85B32]'
                    }`}
                  >
                    <span>{rel.emoji}</span>
                    <span>{rel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates: Date of Birth & Celebration Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#38251F] mb-2">
                Date of Birth <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={e => updateFormData({ birth_date: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#FFF6F0]/50 border border-[#FFBFA8] text-sm text-[#38251F] outline-none focus:border-[#E85B32] focus:ring-2 focus:ring-[#FFBFA8]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#38251F] mb-2">
                Celebration Date <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.celebration_date}
                  onChange={e => updateFormData({ celebration_date: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#FFF6F0]/50 border border-[#FFBFA8] text-sm text-[#38251F] outline-none focus:border-[#E85B32] focus:ring-2 focus:ring-[#FFBFA8]/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-semibold text-base shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Continue to Balloon Questions</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

