import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Lock, Sparkles, AlertCircle, Heart } from 'lucide-react';
import type { RecipientSurprise, CustomThemeData } from '../../types/birthday';
import { getRecipientSurprise, verifyRecipientPassword } from '../../utils/api';
import { sound, type MusicTrackId } from '../../utils/audio';
import { DEFAULT_THEME } from '../../utils/themes';
import { StarrySky } from '../StarrySky';
import { FloatingElements } from '../FloatingElements';

// Scenes
import { SceneReveal } from './SceneReveal';
import { SceneCake } from './SceneCake';
import { SceneBalloons } from './SceneBalloons';
import { SceneVoice } from './SceneVoice';
import { SceneLetter } from './SceneLetter';
import { SceneGallery } from './SceneGallery';
import { SceneCelebration } from './SceneCelebration';

interface RecipientExperienceProps {
  slug: string;
}

export const RecipientExperience: React.FC<RecipientExperienceProps> = ({ slug }) => {
  const [data, setData] = useState<RecipientSurprise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password Unlock State
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifyingPwd, setVerifyingPwd] = useState<boolean>(false);

  // Scene navigation
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasStartedMusic, setHasStartedMusic] = useState<boolean>(false);

  useEffect(() => {
    fetchSurprise();
    return () => {
      sound.stopMusic();
    };
  }, [slug]);

  const fetchSurprise = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getRecipientSurprise(slug);
      setData(res);

      // Start music if surprise is unlocked and music enabled
      if (!res.is_password_protected) {
        initThemeAndAudio(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'This birthday surprise link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const initThemeAndAudio = (surpriseData: RecipientSurprise) => {
    const track = (surpriseData.custom_theme?.music_url || surpriseData.settings?.selected_music || 'happy-birthday') as MusicTrackId;
    if (!hasStartedMusic) {
      // Sound controller plays on user interaction or start
      sound.playMusic(track);
      setHasStartedMusic(true);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setVerifyingPwd(true);
    setPasswordError(null);
    try {
      const unlocked = await verifyRecipientPassword(slug, passwordInput.trim());
      setData(unlocked);
      initThemeAndAudio(unlocked);
      sound.playSparkle();
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect secret code. Ask the sender!');
    } finally {
      setVerifyingPwd(false);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMute(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#170D2D] flex flex-col items-center justify-center text-white px-4">
        <div className="w-12 h-12 border-3 border-[#E85B32] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-[#FFBFA8]">Opening your birthday surprise...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#170D2D] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Birthday Surprise Unavailable</h2>
        <p className="text-sm text-gray-300 max-w-md">{errorMsg}</p>
      </div>
    );
  }

  // ── PASSWORD UNLOCK SCREEN ──
  if (data?.is_password_protected) {
    return (
      <div className="min-h-screen bg-[#170D2D] flex items-center justify-center px-4 relative overflow-hidden">
        <StarrySky />
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center relative z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#E85B32]/40">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Secret Surprise for {data.recipient_name}
          </h3>
          <p className="text-xs sm:text-sm text-[#FFBFA8] mb-6">
            Locked with love by {data.sender_name}. Enter the secret code to open your surprise!
          </p>

          {passwordError && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter secret passcode..."
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-center font-mono text-sm outline-none focus:border-[#E85B32] focus:ring-2 focus:ring-[#E85B32]/30 transition-all"
              autoFocus
            />

            <button
              type="submit"
              disabled={verifyingPwd}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white font-bold text-sm shadow-xl shadow-[#E85B32]/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {verifyingPwd ? "Unlocking..." : "Unlock Birthday Magic ✨"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Active theme from creator
  const theme: CustomThemeData = data.custom_theme || DEFAULT_THEME;
  const hasVoice = Boolean(data.voice_message?.audio_url);
  const hasMemories = Boolean(data.memories && data.memories.length > 0);

  // Build sequential scenes array
  // 0: Reveal, 1: Cake, 2: Balloons, 3: Voice (if any), 4: Letter, 5: Gallery (if any), 6: Celebration
  const sceneFlow: string[] = ['reveal', 'cake', 'balloons'];
  if (hasVoice) sceneFlow.push('voice');
  sceneFlow.push('letter');
  if (hasMemories) sceneFlow.push('gallery');
  sceneFlow.push('celebration');

  const totalScenes = sceneFlow.length;
  const currentSceneName = sceneFlow[currentScene] || 'reveal';

  const nextScene = () => {
    if (currentScene < totalScenes - 1) {
      setCurrentScene(prev => prev + 1);
      sound.playSparkle();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevScene = () => {
    if (currentScene > 0) {
      setCurrentScene(prev => prev - 1);
      sound.playClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundColor: theme.background_color || '#170D2D',
        color: theme.text_color || '#FFFFFF',
        fontFamily: theme.body_font || 'Poppins'
      }}
    >
      {/* Dynamic Background Atmosphere */}
      {theme.background_type === 'starry' && <StarrySky />}
      {theme.animation_settings?.hearts && <FloatingElements />}

      {/* Floating Audio Toggle Button (Subtle & clean, bottom-left) */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
          title={isMuted ? "Unmute Music" : "Mute Music"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-300" /> : <Volume2 className="w-5 h-5 text-[#FFD166]" />}
        </button>
      </div>

      {/* Floating Scene Progress Dots (Top center, non-intrusive) */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
        {sceneFlow.map((_, idx) => (
          <span
            key={idx}
            className={`transition-all rounded-full ${
              idx === currentScene
                ? 'w-6 h-2 bg-gradient-to-r from-[#E85B32] to-[#FFD166]'
                : idx < currentScene
                ? 'w-2 h-2 bg-white/60'
                : 'w-2 h-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Main Scene Presentation Container */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-12">
        <AnimatePresence mode="wait">
          {/* SCENE 1: REVEAL */}
          {currentSceneName === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneReveal
                recipientName={data.recipient_name}
                senderName={data.sender_name}
                birthdayMessage={data.birthday_message}
                onNext={nextScene}
              />
            </motion.div>
          )}

          {/* SCENE 2: CAKE */}
          {currentSceneName === 'cake' && (
            <motion.div
              key="cake"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneCake
                recipientName={data.recipient_name}
                onNext={nextScene}
                onPrev={prevScene}
              />
            </motion.div>
          )}

          {/* SCENE 3: BALLOONS */}
          {currentSceneName === 'balloons' && (
            <motion.div
              key="balloons"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneBalloons
                wishes={data.wishes}
                recipientName={data.recipient_name}
                onNext={nextScene}
                onPrev={prevScene}
              />
            </motion.div>
          )}

          {/* SCENE 4: VOICE MESSAGE */}
          {currentSceneName === 'voice' && data.voice_message && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneVoice
                voiceMessage={data.voice_message}
                senderName={data.sender_name}
                recipientName={data.recipient_name}
                onNext={nextScene}
                onPrev={prevScene}
              />
            </motion.div>
          )}

          {/* SCENE 5: LETTER */}
          {currentSceneName === 'letter' && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneLetter
                letter={data.birthday_letter || ''}
                senderName={data.sender_name}
                recipientName={data.recipient_name}
                onNext={nextScene}
                onPrev={prevScene}
              />
            </motion.div>
          )}

          {/* SCENE 6: GALLERY */}
          {currentSceneName === 'gallery' && hasMemories && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneGallery
                memories={data.memories}
                recipientName={data.recipient_name}
                onNext={nextScene}
                onPrev={prevScene}
              />
            </motion.div>
          )}

          {/* SCENE 7: CELEBRATION (STRICTLY CLEAN FOR RECIPIENT) */}
          {currentSceneName === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SceneCelebration
                recipientName={data.recipient_name}
                senderName={data.sender_name}
                onReplay={() => setCurrentScene(0)}
                onPrev={prevScene}
                isRecipient={true} // STRICTLY ENFORCES ZERO SHARING OR CREATOR BUTTONS
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
