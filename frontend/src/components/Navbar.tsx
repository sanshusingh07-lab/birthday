import React from 'react';
import { 
  Gift, 
  LayoutDashboard, 
  PlusCircle, 
  Music, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Eye 
} from 'lucide-react';
import { useBirthday } from '../context/BirthdayContext';

export const Navbar: React.FC = () => {
  const {
    currentStep,
    viewMode,
    setViewMode,
    goToStep,
    audioPlaying,
    toggleMusic,
    isAudioMuted,
    toggleMute,
    resetDraft,
    isAdminMode,
    setIsAdminMode
  } = useBirthday();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FFF6F0]/85 border-b border-[#FFBFA8]/40 text-[#38251F]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            setIsAdminMode(false);
            setViewMode('wizard');
            goToStep(1);
          }}
          className="flex items-center gap-2.5 group transition-transform active:scale-95 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E85B32] to-[#F7A6A0] flex items-center justify-center text-white shadow-md shadow-[#E85B32]/25 group-hover:rotate-6 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight block">
              Birthday Magic
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#E85B32] font-semibold block">
              Personalized Platform
            </span>
          </div>
        </button>

        {/* Steps Progress Pills (when creating, steps 2..8) */}
        {viewMode === 'wizard' && currentStep > 1 && currentStep <= 8 && !isAdminMode && (
          <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-white/70 rounded-full border border-[#FFBFA8]/50 shadow-xs">
            {[
              { num: 2, label: "Star" },
              { num: 3, label: "Balloons" },
              { num: 4, label: "Photos" },
              { num: 5, label: "Letter" },
              { num: 6, label: "Voice" },
              { num: 7, label: "Theme" },
              { num: 8, label: "Review" },
            ].map(s => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => goToStep(s.num as any)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
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
          {/* Dashboard Switcher Button */}
          {viewMode === 'wizard' ? (
            <button
              onClick={() => {
                setViewMode('dashboard');
                window.history.pushState({}, '', '/dashboard');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-[#38251F] transition-all cursor-pointer shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#E85B32]" />
              <span className="hidden sm:inline">My Surprises</span>
            </button>
          ) : (
            <button
              onClick={() => {
                resetDraft();
                goToStep(2);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#E85B32] text-white transition-all cursor-pointer shadow-xs hover:bg-[#d44e26]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
          )}

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              audioPlaying
                ? 'bg-[#E85B32] text-white border-[#E85B32] shadow-xs'
                : 'bg-white/80 text-[#38251F] border-[#FFBFA8] hover:bg-white'
            }`}
            title={audioPlaying ? "Pause Background Music" : "Play Background Music"}
          >
            <Music className={`w-4 h-4 ${audioPlaying ? 'animate-pulse' : ''}`} />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-50 text-rose-500 border-rose-200'
                : 'bg-white/80 text-[#38251F] border-[#FFBFA8] hover:bg-white'
            }`}
            title={isAudioMuted ? "Unmute Audio" : "Mute Sound Effects"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Admin Dashboard Toggle */}
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`p-2 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              isAdminMode
                ? 'bg-[#38251F] text-white border-[#38251F]'
                : 'bg-white/80 text-gray-500 border-[#FFBFA8] hover:text-[#38251F]'
            }`}
            title="Admin Stats & Database"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
