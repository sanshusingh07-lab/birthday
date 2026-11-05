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

export interface BirthdaySettings {
  music_enabled: boolean;
  selected_theme: string;
  animation_enabled: boolean;
  selected_music?: MusicTrackId;
}

export interface BirthdaySurprise {
  id?: number;
  unique_slug: string;
  recipient_name: string;
  sender_name: string;
  relationship: string;
  birth_date?: string;
  celebration_date?: string;
  birthday_message?: string;
  birthday_letter?: string;
  created_at?: string;
  wishes: BirthdayWish[];
  memories: MemoryItem[];
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
  settings: BirthdaySettings;
}

export interface AdminStats {
  total_surprises: number;
  total_memories: number;
  total_wishes: number;
  latest_surprises: BirthdaySurprise[];
}
