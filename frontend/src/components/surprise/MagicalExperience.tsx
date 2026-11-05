import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarrySky } from '../StarrySky';
import { SceneReveal } from './SceneReveal';
import { SceneCake } from './SceneCake';
import { SceneBalloons } from './SceneBalloons';
import { SceneLetter } from './SceneLetter';
import { SceneGallery } from './SceneGallery';
import { SceneCelebration } from './SceneCelebration';
import { ShareModal } from '../ShareModal';
import { useBirthday } from '../../context/BirthdayContext';
import { sound, MUSIC_TRACKS, MusicTrackId } from '../../utils/audio';
import { Music, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';

const SCENE_NAMES = [
  { id: 1, title: 'Reveal', emoji: '🎁' },
  { id: 2, title: 'Cake', emoji: '🎂' },
  { id: 3, title: 'Balloons', emoji: '🎈' },
  { id: 4, title: 'Letter', emoji: '💌' },
  { id: 5, title: 'Memories', emoji: '📸' },
  { id: 6, title: 'Finale', emoji: '🎆' },
];

export const MagicalExperience: React.FC = () => {
  const {
    activeSurprise,
    formData,
    resetDraft,
    audioPlaying,
    toggleMusic,
    isAudioMuted,
    toggleMute,
    selectedTrack,
    changeTrack
  } = useBirthday();

  const [currentScene, setCurrentScene] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  const surprise = activeSurprise || {
    recipient_name: formData.recipient_name || 'Friend',
    sender_name: formData.sender_name || 'Someone who loves you',
    relationship: formData.relationship || 'Friend',
    unique_slug: 'demo-magic',
    birthday_letter: formData.birthday_letter,
    wishes: formData.wishes.filter(w => w.answer && w.answer.trim().length > 0),
    memories: formData.memories,
    settings: formData.settings
  };

  const handleNextScene = () => {
    sound.playClick();
    setCurrentScene(prev => (prev < 6 ? prev + 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevScene = () => {
    sound.playClick();
    setCurrentScene(prev => (prev > 1 ? prev - 1 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToScene = (sceneNum: number) => {
    sound.playClick();
    setCurrentScene(sceneNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplay = () => {
    sound.playSparkle();
    setCurrentScene(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#170D2D] text-white selection:bg-[#FF80AB] selection:text-[#170D2D] overflow-x-hidden flex flex-col justify-between">
      {/* Interactive Starry Sky Background */}
      <StarrySky />

      {/* Top Scene Navigation Indicator */}
      <div className="sticky top-0 z-40 bg-[#170D2D]/75 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold text-[#FFBFA8] uppercase tracking-wider hidden sm:block">
            Birthday Experience
          </span>

          {/* Scene indicator pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0">
            {SCENE_NAMES.map(s => {
              const isActive = currentScene === s.id;
              const isPassed = currentScene > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleGoToScene(s.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E85B32] to-[#FF6B8B] text-white shadow-md shadow-[#E85B32]/40 scale-105'
                      : isPassed
                      ? 'bg-white/15 text-white/90 hover:bg-white/25'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="hidden md:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#FFD166] font-mono hidden sm:block">
            {currentScene} / 6
          </div>
        </div>
      </div>

      {/* Main Scene Container with Smooth Fade Transitions */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 px-4">
        <AnimatePresence mode="wait">
          {currentScene === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneReveal
                recipientName={surprise.recipient_name}
                senderName={surprise.sender_name}
                onNext={handleNextScene}
              />
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneCake
                recipientName={surprise.recipient_name}
                onNext={handleNextScene}
                onPrev={handlePrevScene}
              />
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneBalloons
                wishes={surprise.wishes}
                recipientName={surprise.recipient_name}
                onNext={handleNextScene}
                onPrev={handlePrevScene}
              />
            </motion.div>
          )}

          {currentScene === 4 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneLetter
                letter={surprise.birthday_letter || ''}
                recipientName={surprise.recipient_name}
                senderName={surprise.sender_name}
                onNext={handleNextScene}
                onPrev={handlePrevScene}
              />
            </motion.div>
          )}

          {currentScene === 5 && (
            <motion.div
              key="scene-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneGallery
                memories={surprise.memories}
                recipientName={surprise.recipient_name}
                onNext={handleNextScene}
                onPrev={handlePrevScene}
              />
            </motion.div>
          )}

          {currentScene === 6 && (
            <motion.div
              key="scene-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneCelebration
                recipientName={surprise.recipient_name}
                senderName={surprise.sender_name}
                onReplay={handleReplay}
                onShare={() => setIsShareModalOpen(true)}
                onCreateNew={resetDraft}
                onPrev={handlePrevScene}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Bar: Music Controls & Track Selector */}
      <footer className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {/* Track Selection Popover */}
        <AnimatePresence>
          {showMusicMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="p-3 rounded-2xl bg-[#1F1238]/95 backdrop-blur-md border border-white/20 shadow-2xl w-64 text-left mb-2"
            >
              <p className="text-[11px] uppercase font-bold text-[#FFD166] tracking-wider mb-2 px-1">
                Select Background Music 🎵
              </p>
              <div className="space-y-1">
                {MUSIC_TRACKS.map(t => {
                  const isCur = selectedTrack === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        changeTrack(t.id);
                        if (!audioPlaying) toggleMusic();
                        setShowMusicMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isCur
                          ? 'bg-[#E85B32] text-white font-bold shadow-xs'
                          : 'bg-white/5 hover:bg-white/15 text-white/80'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{t.emoji}</span>
                        <span className="truncate">{t.title}</span>
                      </span>
                      {isCur && <span className="text-[10px] text-amber-200">Active</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating audio control pill */}
        <div className="flex items-center gap-2 p-2 rounded-full bg-[#1F1238]/85 backdrop-blur-md border border-white/20 shadow-2xl">
          {/* Track selector button */}
          <button
            onClick={() => setShowMusicMenu(!showMusicMenu)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#FFD166] flex items-center gap-1.5 transition-all cursor-pointer"
            title="Change Background Music"
          >
            <span>🎵</span>
            <span className="max-w-[100px] truncate hidden sm:inline">
              {MUSIC_TRACKS.find(t => t.id === selectedTrack)?.title || 'Music'}
            </span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>

          {/* Music Play/Pause */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              audioPlaying
                ? 'bg-[#E85B32] text-white shadow-md shadow-[#E85B32]/40'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            title={audioPlaying ? "Pause Music" : "Play Music"}
          >
            <Music className={`w-3.5 h-3.5 ${audioPlaying ? 'animate-pulse' : ''}`} />
          </button>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-all cursor-pointer"
            title={isAudioMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </footer>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          slug={surprise.unique_slug}
          recipientName={surprise.recipient_name}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};
