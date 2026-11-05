import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BirthdayFormData, BirthdaySurprise, MemoryItem } from '../types/birthday';
import { createSurprise, getSurpriseBySlug } from '../utils/api';
import { sound, MusicTrackId } from '../utils/audio';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const DEFAULT_QUESTIONS = [
  {
    question: "What makes this person special?",
    suggestions: [
      "Their contagious laughter and radiant energy",
      "How they always listen with genuine empathy and care",
      "Their fierce loyalty and supportive nature",
      "Their passion, drive, and creativity"
    ]
  },
  {
    question: "What is your favourite memory together?",
    suggestions: [
      "The late night drives singing along to our favourite songs",
      "Laughing so hard we couldn't breathe in the coffee shop",
      "That unforgettable trip where everything went delightfully crazy",
      "Staying up until 4 AM talking about our wildest dreams"
    ]
  },
  {
    question: "What do you love most about them?",
    suggestions: [
      "Their pure heart and unwavering honesty",
      "The way their eyes light up when they talk about what they love",
      "Their incredible sense of humor and quick wit",
      "The comfort and warmth they bring everywhere they go"
    ]
  },
  {
    question: "What is one thing you wish for them?",
    suggestions: [
      "Boundless joy, endless peace, and success in everything they chase",
      "A year filled with spontaneous adventures and quiet serenity",
      "To always know how deeply loved and cherished they are",
      "That every dream they whisper to the universe comes true"
    ]
  },
  {
    question: "Describe this person in three words.",
    suggestions: [
      "Radiant, Fearless, Unforgettable",
      "Kind-hearted, Brilliant, Hilarious",
      "Gentle, Inspiring, Pure-hearted",
      "Adventurous, Loyal, Magical"
    ]
  }
];

const INITIAL_FORM_DATA: BirthdayFormData = {
  recipient_name: '',
  sender_name: '',
  relationship: 'Friend',
  birth_date: '',
  celebration_date: '',
  birthday_message: '',
  birthday_letter: '',
  wishes: DEFAULT_QUESTIONS.map(q => ({
    question: q.question,
    answer: ''
  })),
  memories: [],
  settings: {
    music_enabled: true,
    selected_theme: 'cosmic-purple',
    animation_enabled: true,
    selected_music: 'happy-birthday'
  }
};

const STORAGE_KEY = 'birthday_surprise_draft_v1';

interface BirthdayContextType {
  currentStep: StepNumber;
  formData: BirthdayFormData;
  activeSurprise: BirthdaySurprise | null;
  isLoadingMagic: boolean;
  magicLoadingStep: string;
  isSubmitting: boolean;
  error: string | null;
  audioPlaying: boolean;
  isAudioMuted: boolean;
  selectedTrack: MusicTrackId;
  isAdminMode: boolean;
  setCurrentStep: (step: StepNumber) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: StepNumber) => void;
  updateFormData: (data: Partial<BirthdayFormData>) => void;
  updateWish: (index: number, answer: string) => void;
  addMemory: (memory: MemoryItem) => void;
  removeMemory: (index: number) => void;
  updateMemoryCaption: (index: number, caption: string) => void;
  submitSurprise: () => Promise<BirthdaySurprise>;
  loadSurpriseBySlug: (slug: string) => Promise<void>;
  resetDraft: () => void;
  loadDemoSurprise: () => void;
  toggleMusic: () => void;
  toggleMute: () => void;
  changeTrack: (track: MusicTrackId) => void;
  setIsAdminMode: (admin: boolean) => void;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export const BirthdayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [formData, setFormData] = useState<BirthdayFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read draft from localStorage:", e);
    }
    return INITIAL_FORM_DATA;
  });

  const [activeSurprise, setActiveSurprise] = useState<BirthdaySurprise | null>(null);
  const [isLoadingMagic, setIsLoadingMagic] = useState<boolean>(false);
  const [magicLoadingStep, setMagicLoadingStep] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackId>(
    (formData.settings?.selected_music as MusicTrackId) || 'happy-birthday'
  );
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Auto-save form data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      // storage quota or error
    }
  }, [formData]);

  // Handle URL route inspection (e.g. /surprise/:slug or /admin)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/surprise/')) {
      const slug = path.split('/surprise/')[1];
      if (slug) {
        loadSurpriseBySlug(slug);
      }
    } else if (path === '/admin') {
      setIsAdminMode(true);
    }
  }, []);

  const updateFormData = (patch: Partial<BirthdayFormData>) => {
    setFormData(prev => ({ ...prev, ...patch }));
  };

  const updateWish = (index: number, answer: string) => {
    setFormData(prev => {
      const newWishes = [...prev.wishes];
      if (newWishes[index]) {
        newWishes[index] = { ...newWishes[index], answer };
      }
      return { ...prev, wishes: newWishes };
    });
  };

  const addMemory = (memory: MemoryItem) => {
    setFormData(prev => ({
      ...prev,
      memories: [...prev.memories, memory]
    }));
  };

  const removeMemory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      memories: prev.memories.filter((_, i) => i !== index)
    }));
  };

  const updateMemoryCaption = (index: number, caption: string) => {
    setFormData(prev => {
      const updated = [...prev.memories];
      if (updated[index]) {
        updated[index] = { ...updated[index], caption };
      }
      return { ...prev, memories: updated };
    });
  };

  const nextStep = () => {
    sound.playClick();
    setCurrentStep(prev => (prev < 7 ? ((prev + 1) as StepNumber) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    sound.playClick();
    setCurrentStep(prev => (prev > 1 ? ((prev - 1) as StepNumber) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step: StepNumber) => {
    sound.playClick();
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMusic = () => {
    const isPlaying = sound.toggleMusic();
    setAudioPlaying(isPlaying);
  };

  const toggleMute = () => {
    const nextMuted = !isAudioMuted;
    sound.setMuted(nextMuted);
    setIsAudioMuted(nextMuted);
  };

  const changeTrack = (track: MusicTrackId) => {
    setSelectedTrack(track);
    sound.setTrack(track);
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        selected_music: track
      }
    }));
  };

  const submitSurprise = async (): Promise<BirthdaySurprise> => {
    setIsSubmitting(true);
    setError(null);
    setIsLoadingMagic(true);

    const stages = [
      "Collecting beautiful memories...",
      "Preparing your birthday surprise...",
      "Adding a little magic...",
      "Almost ready! ✨"
    ];

    try {
      // Step through the beautiful loading stages
      for (let i = 0; i < stages.length; i++) {
        setMagicLoadingStep(stages[i]);
        sound.playSparkle();
        await new Promise(r => setTimeout(r, 850));
      }

      const created = await createSurprise({
        ...formData,
        settings: {
          ...formData.settings,
          selected_music: selectedTrack
        }
      });
      setActiveSurprise(created);
      
      // Auto-start music in the magical final experience if enabled
      if (created.settings?.music_enabled) {
        sound.setTrack(selectedTrack);
        sound.startBackgroundMusic(selectedTrack);
        setAudioPlaying(true);
      }

      setCurrentStep(7);
      window.history.pushState({}, '', `/surprise/${created.unique_slug}`);
      return created;
    } catch (err: any) {
      setError(err.message || 'Something went wrong while creating the surprise.');
      throw err;
    } finally {
      setIsSubmitting(false);
      setIsLoadingMagic(false);
    }
  };

  const loadSurpriseBySlug = async (slug: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const surprise = await getSurpriseBySlug(slug);
      setActiveSurprise(surprise);
      setCurrentStep(7);
      const track = (surprise.settings?.selected_music as MusicTrackId) || 'happy-birthday';
      setSelectedTrack(track);
      if (surprise.settings?.music_enabled) {
        sound.setTrack(track);
        sound.startBackgroundMusic(track);
        setAudioPlaying(true);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load birthday surprise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDraft = () => {
    sound.playClick();
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL_FORM_DATA);
    setActiveSurprise(null);
    setCurrentStep(1);
    window.history.pushState({}, '', '/');
  };

  const loadDemoSurprise = () => {
    sound.playSparkle();
    loadSurpriseBySlug('maya-birthday-magic');
  };

  return (
    <BirthdayContext.Provider
      value={{
        currentStep,
        formData,
        activeSurprise,
        isLoadingMagic,
        magicLoadingStep,
        isSubmitting,
        error,
        audioPlaying,
        isAudioMuted,
        selectedTrack,
        isAdminMode,
        setCurrentStep,
        nextStep,
        prevStep,
        goToStep,
        updateFormData,
        updateWish,
        addMemory,
        removeMemory,
        updateMemoryCaption,
        submitSurprise,
        loadSurpriseBySlug,
        resetDraft,
        loadDemoSurprise,
        toggleMusic,
        toggleMute,
        changeTrack,
        setIsAdminMode
      }}
    >
      {children}
    </BirthdayContext.Provider>
  );
};

export const useBirthday = () => {
  const context = useContext(BirthdayContext);
  if (!context) {
    throw new Error('useBirthday must be used within a BirthdayProvider');
  }
  return context;
};
