import type { CustomThemeData, ThemePresetName } from '../types/birthday';

export interface ThemePreset {
  id: ThemePresetName;
  name: string;
  description: string;
  tagline: string;
  theme: CustomThemeData;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dark-galaxy',
    name: 'Dark Galaxy',
    description: 'Deep cosmic purple, shimmering starlight & glowing ethereal nebula',
    tagline: 'Magical & Infinite ✨',
    theme: {
      theme_name: 'dark-galaxy',
      primary_color: '#E85B32',
      secondary_color: '#FFBFA8',
      background_color: '#170D2D',
      text_color: '#FFFFFF',
      accent_color: '#FFD166',
      card_background: 'rgba(255, 255, 255, 0.08)',
      heading_font: 'Playfair Display',
      body_font: 'Poppins',
      background_type: 'starry',
      background_value: 'radial-gradient(circle at 50% 20%, #2b1055 0%, #170d2d 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'medium'
      },
      music_url: 'happy-birthday'
    }
  },
  {
    id: 'romantic',
    name: 'Romantic Love',
    description: 'Blush roses, deep velvet crimson & floating hearts for your soulmate',
    tagline: 'Warm & Heartfelt ❤️',
    theme: {
      theme_name: 'romantic',
      primary_color: '#E63946',
      secondary_color: '#FFAFCC',
      background_color: '#240016',
      text_color: '#FFF0F5',
      accent_color: '#FFB703',
      card_background: 'rgba(255, 175, 204, 0.12)',
      heading_font: 'Playfair Display',
      body_font: 'Caveat',
      background_type: 'hearts',
      background_value: 'radial-gradient(circle at 50% 30%, #4a0028 0%, #1a0010 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: false,
        typewriter: true,
        glow: true,
        intensity: 'high'
      },
      music_url: 'starlight-waltz'
    }
  },
  {
    id: 'friendship',
    name: 'Best Friendship',
    description: 'Warm sunny peach, golden glow & nostalgic cheerful energy',
    tagline: 'Pure Joy & Sunshine ☀️',
    theme: {
      theme_name: 'friendship',
      primary_color: '#F77F00',
      secondary_color: '#FFD166',
      background_color: '#211812',
      text_color: '#FFFDF9',
      accent_color: '#06D6A0',
      card_background: 'rgba(255, 209, 102, 0.12)',
      heading_font: 'Poppins',
      body_font: 'Poppins',
      background_type: 'confetti',
      background_value: 'radial-gradient(circle at 50% 30%, #3d2314 0%, #1c100a 100%)',
      animation_settings: {
        balloons: true,
        hearts: false,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'high'
      },
      music_url: 'cheerful-celebration'
    }
  },
  {
    id: 'cute',
    name: 'Cute & Sweet',
    description: 'Bubblegum pastel pink, cotton candy clouds & adorable joy',
    tagline: 'Sweet as Candy 🍭',
    theme: {
      theme_name: 'cute',
      primary_color: '#FF70A6',
      secondary_color: '#FFD670',
      background_color: '#2E1728',
      text_color: '#FFFFFF',
      accent_color: '#70D6FF',
      card_background: 'rgba(255, 255, 255, 0.14)',
      heading_font: 'Caveat',
      body_font: 'Poppins',
      background_type: 'clouds',
      background_value: 'radial-gradient(circle at 50% 30%, #521c43 0%, #260b1e 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'medium'
      },
      music_url: 'dreamy-ambient'
    }
  },
  {
    id: 'luxury',
    name: 'Royal Luxury',
    description: 'Pure obsidian noir, warm Champagne gold & royal editorial elegance',
    tagline: 'Timeless Prestige 👑',
    theme: {
      theme_name: 'luxury',
      primary_color: '#D4AF37',
      secondary_color: '#F4E0A5',
      background_color: '#0E0E10',
      text_color: '#F8F6F0',
      accent_color: '#E5C158',
      card_background: 'rgba(212, 175, 55, 0.08)',
      heading_font: 'Playfair Display',
      body_font: 'Poppins',
      background_type: 'particles',
      background_value: 'radial-gradient(circle at 50% 20%, #242018 0%, #0d0d0f 100%)',
      animation_settings: {
        balloons: true,
        hearts: false,
        confetti: false,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'low'
      },
      music_url: 'starlight-waltz'
    }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Ethereal lilac, soft mint mist & dreamy sunset gradient twilight',
    tagline: 'Soft & Serene 🌙',
    theme: {
      theme_name: 'pastel-dream',
      primary_color: '#A06CD5',
      secondary_color: '#E2C2FF',
      background_color: '#1A1429',
      text_color: '#F3ECFF',
      accent_color: '#B8F2E6',
      card_background: 'rgba(160, 108, 213, 0.12)',
      heading_font: 'Playfair Display',
      body_font: 'Poppins',
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #281b40 0%, #150f24 50%, #111d2e 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'medium'
      },
      music_url: 'dreamy-ambient'
    }
  },
  {
    id: 'floral',
    name: 'Botanical Floral',
    description: 'Vintage garden sage, gentle peony pinks & peaceful botanical air',
    tagline: 'Blossoming Grace 🌸',
    theme: {
      theme_name: 'floral',
      primary_color: '#D88373',
      secondary_color: '#F1DABF',
      background_color: '#141E18',
      text_color: '#F4EFEB',
      accent_color: '#A3B18A',
      card_background: 'rgba(241, 218, 191, 0.1)',
      heading_font: 'Playfair Display',
      body_font: 'Caveat',
      background_type: 'floral',
      background_value: 'radial-gradient(circle at 50% 30%, #1d2e24 0%, #0d1410 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: false,
        fireworks: true,
        sparkles: true,
        stars: false,
        typewriter: true,
        glow: true,
        intensity: 'medium'
      },
      music_url: 'starlight-waltz'
    }
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    description: 'Sleek monochromatic dark, ultra-crisp typography & architectural calm',
    tagline: 'Clean & Sophisticated 🤍',
    theme: {
      theme_name: 'minimal',
      primary_color: '#E5E5E5',
      secondary_color: '#9E9E9E',
      background_color: '#121214',
      text_color: '#FFFFFF',
      accent_color: '#8A8A8E',
      card_background: 'rgba(255, 255, 255, 0.05)',
      heading_font: 'Poppins',
      body_font: 'Poppins',
      background_type: 'solid',
      background_value: '#121214',
      animation_settings: {
        balloons: false,
        hearts: false,
        confetti: false,
        fireworks: true,
        sparkles: true,
        stars: false,
        typewriter: true,
        glow: false,
        intensity: 'low'
      },
      music_url: 'dreamy-ambient'
    }
  },
  {
    id: 'neon-party',
    name: 'Neon Party',
    description: 'Electrifying cyan, neon magenta & midnight rave dance celebration',
    tagline: 'Rave & Radiance ⚡',
    theme: {
      theme_name: 'neon-party',
      primary_color: '#00F0FF',
      secondary_color: '#FF007F',
      background_color: '#0A051B',
      text_color: '#FFFFFF',
      accent_color: '#FFE600',
      card_background: 'rgba(0, 240, 255, 0.08)',
      heading_font: 'Poppins',
      body_font: 'Poppins',
      background_type: 'particles',
      background_value: 'radial-gradient(circle at 50% 30%, #200538 0%, #080314 100%)',
      animation_settings: {
        balloons: true,
        hearts: false,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'high'
      },
      music_url: 'cheerful-celebration'
    }
  },
  {
    id: 'cartoon',
    name: 'Whimsical Cartoon',
    description: 'Vibrant sunshine yellow, playful sky blue & bubbly bouncy cheer',
    tagline: 'Playful & Bouncy 🎈',
    theme: {
      theme_name: 'cartoon',
      primary_color: '#FF9F1C',
      secondary_color: '#2EC4B6',
      background_color: '#1B152B',
      text_color: '#FFFFFF',
      accent_color: '#E71D36',
      card_background: 'rgba(46, 196, 182, 0.12)',
      heading_font: 'Caveat',
      body_font: 'Poppins',
      background_type: 'confetti',
      background_value: 'radial-gradient(circle at 50% 30%, #2d1847 0%, #140c21 100%)',
      animation_settings: {
        balloons: true,
        hearts: true,
        confetti: true,
        fireworks: true,
        sparkles: true,
        stars: true,
        typewriter: true,
        glow: true,
        intensity: 'high'
      },
      music_url: 'cheerful-celebration'
    }
  }
];

export const DEFAULT_THEME = THEME_PRESETS[0].theme;

export const AVAILABLE_FONTS = [
  { name: 'Playfair Display', label: 'Playfair Display (Serif / Regal)', family: "'Playfair Display', serif" },
  { name: 'Poppins', label: 'Poppins (Modern Clean Sans)', family: "'Poppins', sans-serif" },
  { name: 'Caveat', label: 'Caveat (Warm Handwritten Cursive)', family: "'Caveat', cursive" }
];

export const BACKGROUND_TYPES = [
  { id: 'starry', label: 'Starry Cosmic Sky', icon: '✨' },
  { id: 'gradient', label: 'Smooth Gradient', icon: '🎨' },
  { id: 'hearts', label: 'Floating Hearts', icon: '💖' },
  { id: 'confetti', label: 'Falling Confetti', icon: '🎉' },
  { id: 'particles', label: 'Glowing Particles', icon: '🔮' },
  { id: 'clouds', label: 'Dreamy Clouds', icon: '☁️' },
  { id: 'floral', label: 'Botanical Bloom', icon: '🌸' },
  { id: 'solid', label: 'Minimal Solid', icon: '⬛' }
];

export function getThemePreset(id: string): CustomThemeData {
  const found = THEME_PRESETS.find(p => p.id === id);
  return found ? JSON.parse(JSON.stringify(found.theme)) : JSON.parse(JSON.stringify(DEFAULT_THEME));
}
