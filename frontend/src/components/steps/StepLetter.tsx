import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Wand2, Heart, Smile, Flame, Copy, Check, RefreshCw } from 'lucide-react';
import { useBirthday } from '../../context/BirthdayContext';
import { generateLetter } from '../../utils/api';
import { sound } from '../../utils/audio';

const STYLES = [
  { id: 'emotional', label: 'Emotional & Heartfelt', emoji: '💖', desc: 'Poetic, sincere, touching gratitude' },
  { id: 'funny', label: 'Funny & Playful', emoji: '😄', desc: 'Humorous, teasing, lighthearted chaos' },
  { id: 'romantic', label: 'Sweet & Romantic', emoji: '🌹', desc: 'Affectionate, tender, devoted love' },
];

export const StepLetter: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useBirthday();
  const [selectedStyle, setSelectedStyle] = useState<string>('emotional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedWish, setCopiedWish] = useState<string | null>(null);
  const [suggestedWishes, setSuggestedWishes] = useState<string[]>([
    "May the upcoming year hold as much warmth, peace, and quiet joy as you bring into my life every single day.",
    "Watching you grow, dream, and overcome has been one of the greatest privileges of my life. Happy Birthday!",
    "Thank you for being the constant anchor, the bright spark, and the heart of so many unforgettable moments.",
    "May every door you open this year lead to happiness, love, and fulfillment beyond what you could have imagined."
  ]);

  // If letter is completely empty on load, auto-generate initial draft
  useEffect(() => {
    if (!formData.birthday_letter) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async (overrideStyle?: string) => {
    const styleToUse = overrideStyle || selectedStyle;
    setIsGenerating(true);
    sound.playSparkle();

    // Prepare answers object
    const answersObj: Record<string, string> = {};
    if (formData.wishes[0]?.answer) answersObj['special'] = formData.wishes[0].answer;
    if (formData.wishes[1]?.answer) answersObj['memory'] = formData.wishes[1].answer;
    if (formData.wishes[2]?.answer) answersObj['love_most'] = formData.wishes[2].answer;
    if (formData.wishes[3]?.answer) answersObj['wish'] = formData.wishes[3].answer;
    if (formData.wishes[4]?.answer) answersObj['three_words'] = formData.wishes[4].answer;

    try {
      const res = await generateLetter({
        recipient_name: formData.recipient_name || 'My Dear',
        sender_name: formData.sender_name || 'Your Loved One',
        relationship: formData.relationship || 'Friend',
        style: styleToUse,
        answers: answersObj
      });

      updateFormData({ birthday_letter: res.letter });
      if (res.suggested_wishes && res.suggested_wishes.length > 0) {
        setSuggestedWishes(res.suggested_wishes);
      }
    } catch (e) {
      console.warn("Letter generation error, falling back to local template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertWish = (wish: string) => {
    sound.playSparkle();
    const current = formData.birthday_letter || '';
    updateFormData({
      birthday_letter: current + `\n\n${wish}`
    });
    setCopiedWish(wish);
    setTimeout(() => setCopiedWish(null), 2000);
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
          <span className="text-xs font-bold text-[#E85B32] uppercase tracking-wider">Step 4 of 7</span>
          <div className="w-24 h-2 bg-[#FFBFA8]/40 rounded-full overflow-hidden">
            <div className="w-[57%] h-full bg-[#E85B32] rounded-full" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFBFA8]/30 border border-[#FFBFA8] text-xs font-semibold text-[#E85B32] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Letter Writer</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#38251F]">
          Write Your Birthday Letter 💌
        </h2>
        <p className="text-sm text-[#38251F]/70 mt-1 max-w-md mx-auto">
          Craft a heartfelt, memorable letter for {formData.recipient_name || 'them'}. Choose a tone or personalize every word.
        </p>
      </div>

      {/* Style Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {STYLES.map(s => {
          const isSelected = selectedStyle === s.id;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                sound.playClick();
                setSelectedStyle(s.id);
                handleGenerate(s.id);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-[#E85B32] shadow-lg shadow-[#E85B32]/10 ring-2 ring-[#E85B32]/30'
                  : 'bg-white/70 border-[#FFBFA8]/60 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-[#38251F] mb-1">
                <span className="text-lg">{s.emoji}</span>
                <span>{s.label}</span>
              </div>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* AI Generate Button Bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-600">
          Letter to {formData.recipient_name || 'Recipient'}
        </span>

        <button
          type="button"
          disabled={isGenerating}
          onClick={() => handleGenerate()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          <span>{isGenerating ? "Writing magic..." : "Regenerate with AI"}</span>
        </button>
      </div>

      {/* Parchment Letter Editor Card */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#FFFDF9] border border-[#E8D8C8] shadow-xl shadow-[#38251F]/5 mb-8">
        {/* Subtle vintage watermark / seal */}
        <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#E85B32]/10 border border-[#E85B32]/30 flex items-center justify-center text-xs text-[#E85B32] font-serif font-bold rotate-12 select-none">
          ✨ LOVE
        </div>

        {/* Salutation */}
        <div className="font-serif text-xl font-bold text-[#38251F] mb-4">
          Dearest {formData.recipient_name || 'Friend'},
        </div>

        {/* Text Area */}
        <textarea
          rows={12}
          value={formData.birthday_letter}
          onChange={e => updateFormData({ birthday_letter: e.target.value })}
          placeholder="Write your personal birthday message here..."
          className="w-full bg-transparent font-serif text-base sm:text-lg leading-relaxed text-[#38251F] outline-none resize-y border-0 focus:ring-0 placeholder:text-gray-400"
        />

        {/* Closing & Sender */}
        <div className="mt-6 pt-4 border-t border-[#E8D8C8]/60 flex items-center justify-between">
          <div className="font-handwriting text-2xl text-[#E85B32]">
            With all my love, {formData.sender_name || 'Me'} ❤️
          </div>
          <span className="text-xs text-gray-400">
            {formData.birthday_letter.length} characters
          </span>
        </div>
      </div>

      {/* Ready-Made Birthday Wishes Shelf */}
      <div className="p-6 rounded-3xl bg-white/80 border border-[#FFBFA8]/60 shadow-xs mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#E85B32]" />
          <h3 className="font-serif font-bold text-sm text-[#38251F]">
            Click to Append a Ready-Made Wish
          </h3>
        </div>

        <div className="space-y-2">
          {suggestedWishes.map((wish, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleInsertWish(wish)}
              className="w-full text-left p-3 rounded-xl bg-[#FFF6F0]/80 hover:bg-white border border-[#FFBFA8]/40 hover:border-[#E85B32] text-xs text-[#38251F] transition-all flex items-start justify-between gap-3 group"
            >
              <span>"{wish}"</span>
              <span className="shrink-0 text-[#E85B32] opacity-60 group-hover:opacity-100 font-semibold text-[11px] flex items-center gap-1">
                {copiedWish === wish ? <Check className="w-3.5 h-3.5" /> : '+ Add'}
              </span>
            </button>
          ))}
        </div>
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
          <span>Review Birthday Surprise</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

