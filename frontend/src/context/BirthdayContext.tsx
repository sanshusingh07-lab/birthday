import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BirthdayFormData, BirthdaySurprise, MemoryItem, VoiceMessageData, CustomThemeData } from '../types/birthday';
import { createSurprise, getSurpriseBySlug } from '../utils/api';
import { sound, type MusicTrackId } from '../utils/audio';
import { DEFAULT_THEME } from '../utils/themes';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ViewMode = 'wizard' | 'dashboard';

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
  voice_message: null,
  custom_theme: JSON.parse(JSON.stringify(DEFAULT_THEME)),
  settings: {
    music_enabled: true,
    selected_theme: 'dark-galaxy',
    animation_enabled: true,
    selected_music: 'happy-birthday'
  },
  visibility: 'unlisted',
  password: '',
  expires_at: ''
};

const STORAGE_KEY = 'birthday_surprise_draft_v2';

interface BirthdayContextType {
  currentStep: StepNumber;
  viewMode: ViewMode;
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
  shareModalSurprise: BirthdaySurprise | null;
  setViewMode: (mode: ViewMode) => void;
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
  loadDemoSurprise: () => void;
  resetDraft: () => void;
  toggleMusic: () => void;
  toggleMute: () => void;
  changeTrack: (track: MusicTrackId) => void;
  setIsAdminMode: (admin: boolean) => void;
  openShareModal: (surprise: BirthdaySurprise) => void;
  closeShareModal: () => void;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export const BirthdayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('wizard');
  const [shareModalSurprise, setShareModalSurprise] = useState<BirthdaySurprise | null>(null);

  const [formData, setFormData] = useState<BirthdayFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_FORM_DATA,
          ...parsed,
          custom_theme: parsed.custom_theme || INITIAL_FORM_DATA.custom_theme
        };
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

  // URL path detection on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setViewMode('dashboard');
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
    setCurrentStep(prev => (prev < 8 ? ((prev + 1) as StepNumber) : prev));
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
    setViewMode('wizard');
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
      },
      custom_theme: {
        ...prev.custom_theme,
        music_url: track
      }
    }));
  };

  const openShareModal = (surprise: BirthdaySurprise) => {
    setShareModalSurprise(surprise);
  };

  const closeShareModal = () => {
    setShareModalSurprise(null);
  };

  const submitSurprise = async (): Promise<BirthdaySurprise> => {
    setIsSubmitting(true);
    setError(null);
    setIsLoadingMagic(true);

    const stages = [
      "Collecting beautiful memories...",
      "Preparing your birthday surprise...",
      "Generating unique shareable link & QR code...",
      "Adding a little magic... Almost ready! ✨"
    ];

    try {
      for (let i = 0; i < stages.length; i++) {
        setMagicLoadingStep(stages[i]);
        sound.playSparkle();
        await new Promise(r => setTimeout(r, 700));
      }

      const created = await createSurprise({
        ...formData,
        settings: {
          ...formData.settings,
          selected_music: selectedTrack
        }
      });
      setActiveSurprise(created);
      
      // Clear draft once created
      localStorage.removeItem(STORAGE_KEY);

      // Transition creator to Creator Dashboard with Share Modal immediately open!
      setViewMode('dashboard');
      setShareModalSurprise(created);
      window.history.pushState({}, '', '/dashboard');

      return created;
    } catch (err: any) {
      console.error("Create surprise failed:", err);
      const msg = err.message || 'Something went wrong while creating the surprise.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
      setIsLoadingMagic(false);
    }
  };

  const resetDraft = () => {
    sound.playClick();
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL_FORM_DATA);
    setActiveSurprise(null);
    setCurrentStep(1);
    setViewMode('wizard');
    window.history.pushState({}, '', '/');
  };

  const loadDemoSurprise = () => {
    sound.playSparkle();
    window.location.href = '/s/maya-birthday-magic';
  };

  return (
    <BirthdayContext.Provider
      value={{
        currentStep,
        viewMode,
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
        shareModalSurprise,
        setViewMode,
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
        loadDemoSurprise,
        resetDraft,
        toggleMusic,
        toggleMute,
        changeTrack,
        setIsAdminMode,
        openShareModal,
        closeShareModal
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
