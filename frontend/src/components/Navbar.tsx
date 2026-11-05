import React from 'react';
import { Sparkles, Music, Volume2, VolumeX, Eye, ShieldCheck, Gift } from 'lucide-react';
import { useBirthday } from '../context/BirthdayContext';

export const Navbar: React.FC = () => {
  const {
    currentStep,
    goToStep,
    audioPlaying,
    toggleMusic,
    isAudioMuted,
    toggleMute,
    loadDemoSurprise,
    resetDraft,
    isAdminMode,
    setIsAdminMode
  } = useBirthday();

  const isMagicalMode = currentStep === 7;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
      isMagicalMode
        ? 'bg-[#170D2D]/70 border-b border-white/10 text-white'
        : 'bg-[#FFF6F0]/80 border-b border-[#FFBFA8]/40 text-[#38251F]'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            setIsAdminMode(false);
            if (currentStep !== 1) goToStep(1);
          }}
          className="flex items-center gap-2.5 group transition-transform active:scale-95 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E85B32] to-[#F7A6A0] flex items-center justify-center text-white shadow-md shadow-[#E85B32]/25 group-hover:rotate-6 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight block">
              Birthday Magic
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#E85B32] font-semibold block">
              Personalized Surprise
            </span>
          </div>
        </button>

        {/* Steps Progress Pills (when creating, steps 2..6) */}
        {!isMagicalMode && currentStep > 1 && currentStep < 7 && !isAdminMode && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full border border-[#FFBFA8]/50 shadow-xs">
            {[
              { num: 2, label: "Star" },
              { num: 3, label: "Balloons" },
              { num: 4, label: "Photos" },
              { num: 5, label: "Letter" },
              { num: 6, label: "Review" },
            ].map(s => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => goToStep(s.num as any)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-[#E85B32] text-white shadow-xs scale-105'
                      : isPassed
                      ? 'text-[#E85B32] hover:bg-[#FFBFA8]/30'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sample Surprise Button */}
          {!isMagicalMode && (
            <button
              onClick={loadDemoSurprise}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#FFBFA8]/30 hover:bg-[#FFBFA8]/60 text-[#38251F] border border-[#FFBFA8] transition-all"
              title="Preview a finished sample surprise"
            >
              <Eye className="w-3.5 h-3.5 text-[#E85B32]" />
              <span>Sample Surprise</span>
            </button>
          )}

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-full border transition-all flex items-center justify-center ${
              audioPlaying
                ? 'bg-[#E85B32] text-white border-[#E85B32] shadow-sm'
                : isMagicalMode
                ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                : 'bg-white/80 text-[#38251F] border-[#FFBFA8] hover:bg-white'
            }`}
            title={audioPlaying ? "Pause Background Music" : "Play Background Music"}
          >
            <Music className={`w-4 h-4 ${audioPlaying ? 'animate-pulse' : ''}`} />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full border transition-all flex items-center justify-center ${
              isAudioMuted
                ? 'bg-red-500/10 text-red-500 border-red-300'
                : isMagicalMode
                ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                : 'bg-white/80 text-[#38251F] border-[#FFBFA8] hover:bg-white'
            }`}
            title={isAudioMuted ? "Unmute Audio" : "Mute Sound Effects"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Admin Dashboard Toggle */}
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`p-2 rounded-full border transition-all flex items-center justify-center ${
              isAdminMode
                ? 'bg-[#38251F] text-white border-[#38251F]'
                : isMagicalMode
                ? 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
                : 'bg-white/80 text-gray-500 border-[#FFBFA8] hover:text-[#38251F]'
            }`}
            title="Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

