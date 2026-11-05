import type { MusicTrackId } from '../utils/audio';

export interface BirthdayWish {
  id?: number;
  question: string;
  answer: string;
}

export interface MemoryItem {
  id?: number;
  image_url: string;
  caption?: string;
  file?: File;
  preview?: string;
}

export interface VoiceMessageData {
  id?: number;
  audio_url: string;
  audio_format?: string;
  duration?: number;
  title?: string;
  cover_image_url?: string;
}

export interface AnimationSettings {
  balloons: boolean;
  hearts: boolean;
  confetti: boolean;
  fireworks: boolean;
  sparkles: boolean;
  stars: boolean;
  typewriter: boolean;
  glow: boolean;
  intensity: 'low' | 'medium' | 'high';
}

export type ThemePresetName = 
  | 'romantic'
  | 'friendship'
  | 'cute'
  | 'luxury'
  | 'dark-galaxy'
  | 'pastel-dream'
  | 'floral'
  | 'minimal'
  | 'neon-party'
  | 'cartoon';

export interface CustomThemeData {
  id?: number;
  theme_name: ThemePresetName | string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  card_background: string;
  heading_font: string;
  body_font: string;
  background_type: 'starry' | 'gradient' | 'hearts' | 'confetti' | 'particles' | 'clouds' | 'floral' | 'solid';
  background_value: string;
  animation_settings: AnimationSettings;
  music_url: MusicTrackId | string;
  custom_settings?: Record<string, any>;
}

export interface BirthdaySettings {
  music_enabled: boolean;
  selected_theme: string;
  animation_enabled: boolean;
  selected_music?: MusicTrackId;
}

export interface BirthdaySurprise {
  id?: number;
  creator_id?: string;
  unique_slug: string;
  recipient_name: string;
  sender_name: string;
  relationship: string;
  birth_date?: string;
  celebration_date?: string;
  birthday_message?: string;
  birthday_letter?: string;
  status?: string;
  visibility?: 'unlisted' | 'password_protected' | 'private';
  has_password?: boolean;
  is_active?: boolean;
  expires_at?: string;
  view_count?: number;
  last_viewed_at?: string;
  created_at?: string;
  updated_at?: string;
  wishes: BirthdayWish[];
  memories: MemoryItem[];
  settings?: BirthdaySettings;
  voice_message?: VoiceMessageData | null;
  custom_theme?: CustomThemeData | null;
}

export interface RecipientSurprise {
  is_password_protected: boolean;
  recipient_name: string;
  sender_name: string;
  relationship?: string;
  birth_date?: string;
  celebration_date?: string;
  birthday_message?: string;
  birthday_letter?: string;
  wishes: BirthdayWish[];
  memories: MemoryItem[];
  voice_message?: VoiceMessageData | null;
  custom_theme?: CustomThemeData | null;
  settings?: BirthdaySettings;
}

export interface BirthdayFormData {
  recipient_name: string;
  sender_name: string;
  relationship: string;
  birth_date: string;
  celebration_date: string;
  birthday_message: string;
  birthday_letter: string;
  wishes: BirthdayWish[];
  memories: MemoryItem[];
  voice_message?: VoiceMessageData | null;
  custom_theme: CustomThemeData;
  settings: BirthdaySettings;
  visibility?: 'unlisted' | 'password_protected' | 'private';
  password?: string;
  expires_at?: string;
}

export interface ShareSettings {
  visibility: 'unlisted' | 'password_protected' | 'private';
  password?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface AnalyticsData {
  surprise_id: number;
  unique_slug: string;
  view_count: number;
  last_viewed_at?: string;
  is_active: boolean;
  visibility: string;
  expires_at?: string;
  is_expired: boolean;
}

export interface AdminStats {
  total_surprises: number;
  total_memories: number;
  total_wishes: number;
  total_voice_messages?: number;
  latest_surprises: BirthdaySurprise[];
}
