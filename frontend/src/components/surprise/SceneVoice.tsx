import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Sparkles, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import type { VoiceMessageData } from '../../types/birthday';
import { sound } from '../../utils/audio';

interface SceneVoiceProps {
  voiceMessage: VoiceMessageData;
  senderName: string;
  recipientName: string;
  onNext: () => void;
  onPrev: () => void;
}

export const SceneVoice: React.FC<SceneVoiceProps> = ({
  voiceMessage,
  senderName,
  recipientName,
  onNext,
  onPrev
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [hasListened, setHasListened] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const duration = voiceMessage.duration || 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    setAudioError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setHasListened(true);
          sound.playSparkle();
        }).catch(err => {
          console.warn("Audio playback notice:", err);
          setIsPlaying(false);
          setAudioError("Tap again to play audio");
        });
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 z-10 relative max-w-2xl mx-auto">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={voiceMessage.audio_url}
        onError={() => setAudioError("Could not stream audio. Please tap play again.")}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <span className="font-serif text-lg sm:text-xl text-[#FFBFA8] font-bold tracking-wide flex items-center justify-center gap-2">
          <span>Listen closely</span>
          <span>🎙️</span>
        </span>
      </motion.div>

      {/* Main Heading */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,191,168,0.4)] mb-2">
          Someone has a special message for you ❤️
        </h2>
        <p className="text-sm sm:text-base text-[#FFD166] font-medium">
          A voice note left just for you by {senderName || 'someone who loves you'}
        </p>
      </div>

      {/* Elegant Voice Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(45, 20, 80, 0.85) 0%, rgba(20, 10, 40, 0.95) 100%)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Glowing aura */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-radial from-[#E85B32]/30 via-[#FF80AB]/20 to-transparent blur-2xl pointer-events-none" />

        {/* Sender pill */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-[#FF80AB] text-[#FF80AB]" />
            <span>From {senderName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#FFD166] font-mono">
            <Volume2 className="w-4 h-4" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Visualizer Waves (Pulsing when playing) */}
        <div className="flex items-center justify-center gap-1.5 h-20 mb-6 px-4">
          {[40, 65, 30, 85, 95, 50, 75, 45, 90, 60, 80, 35, 70, 55, 100, 65, 40, 85, 50, 30].map((h, i) => (
            <motion.div
              key={i}
              animate={isPlaying ? {
                scaleY: [1, 1.8, 0.6, 1.5, 1],
                opacity: [0.7, 1, 0.8, 1, 0.7]
              } : {
                scaleY: 1,
                opacity: 0.5
              }}
              transition={{
                duration: 0.8 + (i % 5) * 0.15,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut",
                delay: (i % 6) * 0.08
              }}
              className="w-1.5 sm:w-2 rounded-full"
              style={{
                height: `${h * 0.5}%`,
                background: isPlaying
                  ? 'linear-gradient(to top, #E85B32, #FF80AB, #FFD166)'
                  : 'rgba(255, 255, 255, 0.4)'
              }}
            />
          ))}
        </div>

        {/* Play / Pause Big Button & Progress */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center shadow-lg shadow-[#E85B32]/40 hover:shadow-2xl transition-all cursor-pointer shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
          </motion.button>

          {/* Timeline & Title */}
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-white text-sm sm:text-base mb-1 truncate">
              {voiceMessage.title || `Birthday Voice Note ❤️`}
            </h4>

            {/* Clickable scrub bar */}
            <div 
              className="w-full h-2 rounded-full bg-white/20 overflow-hidden cursor-pointer mb-1 relative"
              onClick={(e) => {
                if (!audioRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * duration;
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#E85B32] to-[#FFD166] transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Caption below player */}
        <p className="mt-4 text-xs text-white/60 italic">
          {isPlaying ? "Playing your audio message..." : "Touch Play to hear the voice message"}
        </p>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full mt-2">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Balloons</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white text-sm font-bold shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Open Secret Letter 💌</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

