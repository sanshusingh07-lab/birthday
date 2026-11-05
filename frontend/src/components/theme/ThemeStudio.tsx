import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  Music, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Check, 
  ChevronRight,
  Eye,
  Heart
} from 'lucide-react';
import type { CustomThemeData, ThemePresetName } from '../../types/birthday';
import { THEME_PRESETS, AVAILABLE_FONTS, BACKGROUND_TYPES, DEFAULT_THEME, getThemePreset } from '../../utils/themes';
import { sound, MUSIC_TRACKS, type MusicTrackId } from '../../utils/audio';

interface ThemeStudioProps {
  currentTheme: CustomThemeData;
  recipientName: string;
  senderName: string;
  onThemeChange: (theme: CustomThemeData) => void;
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({
  currentTheme,
  recipientName,
  senderName,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'background' | 'animations' | 'music'>('presets');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewScene, setPreviewScene] = useState<'welcome' | 'cake' | 'balloons' | 'voice' | 'letter'>('welcome');
  const [previewPlayingMusic, setPreviewPlayingMusic] = useState<string | null>(null);

  const updateField = <K extends keyof CustomThemeData>(field: K, value: CustomThemeData[K]) => {
    const updated = { ...currentTheme, [field]: value };
    onThemeChange(updated);
  };

  const updateAnimField = (field: keyof CustomThemeData['animation_settings'], value: any) => {
    const updatedAnim = {
      ...currentTheme.animation_settings,
      [field]: value
    };
    updateField('animation_settings', updatedAnim);
  };

  const applyPreset = (presetId: ThemePresetName) => {
    const presetTheme = getThemePreset(presetId);
    onThemeChange(presetTheme);
    sound.playSparkle();
  };

  const resetToDefault = () => {
    onThemeChange(JSON.parse(JSON.stringify(DEFAULT_THEME)));
    sound.playClick();
  };

  const handlePreviewMusic = (trackId: MusicTrackId) => {
    if (previewPlayingMusic === trackId) {
      sound.stopMusic();
      setPreviewPlayingMusic(null);
    } else {
      sound.playMusic(trackId);
      setPreviewPlayingMusic(trackId);
      updateField('music_url', trackId);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* ── LEFT PANEL: THEME CONTROLS & STUDIO TABS ── */}
      <div className="w-full lg:w-7/12 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#FFBFA8]/60 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FFBFA8]/40 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#38251F]">Theme Customization Studio</h3>
              <p className="text-xs text-[#38251F]/60">Personalize styling, fonts, animations & backgrounds</p>
            </div>
          </div>

          <button
            onClick={resetToDefault}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#E85B32] text-xs font-semibold text-[#38251F]/70 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset to default theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF6F0] rounded-2xl mb-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'presets', label: 'Presets', icon: Sparkles },
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'background', label: 'Background', icon: ImageIcon },
            { id: 'animations', label: 'Animations', icon: Sliders },
            { id: 'music', label: 'Music', icon: Music },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); sound.playClick(); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E85B32] text-white shadow-md'
                    : 'text-[#38251F]/70 hover:text-[#38251F] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: PRESETS ── */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Choose one of 10 handcrafted aesthetic themes. You can further customize any preset below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {THEME_PRESETS.map((preset) => {
                const isSelected = currentTheme.theme_name === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-[#E85B32] bg-[#FFF6F0] shadow-md'
                        : 'border-gray-100 hover:border-[#FFBFA8] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif font-bold text-sm text-[#38251F]">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#E85B32] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#38251F]/60 mb-3 line-clamp-1">
                      {preset.description}
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ background: preset.theme.primary_color }} />
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ background: preset.theme.secondary_color }} />
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ background: preset.theme.background_color }} />
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ background: preset.theme.accent_color }} />
                      <span className="text-[10px] text-[#38251F]/50 ml-auto font-mono">
                        {preset.tagline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: COLORS ── */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Fine-tune the individual color palette for buttons, glows, and card accents:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Primary Accent Color', field: 'primary_color', value: currentTheme.primary_color },
                { label: 'Secondary Soft Color', field: 'secondary_color', value: currentTheme.secondary_color },
                { label: 'Background Dark Base', field: 'background_color', value: currentTheme.background_color },
                { label: 'Primary Text Color', field: 'text_color', value: currentTheme.text_color },
                { label: 'Golden / Star Accent', field: 'accent_color', value: currentTheme.accent_color },
                { label: 'Card Backdrop Tint', field: 'card_background', value: currentTheme.card_background, isText: true }
              ].map((c) => (
                <div key={c.field} className="p-3 rounded-2xl bg-[#FFF6F0]/70 border border-[#FFBFA8]/40">
                  <label className="block text-xs font-bold text-[#38251F] mb-1.5">
                    {c.label}
                  </label>
                  <div className="flex items-center gap-2">
                    {!c.isText && (
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => updateField(c.field as any, e.target.value)}
                        className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                      />
                    )}
                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) => updateField(c.field as any, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#FFBFA8] text-xs font-mono text-[#38251F] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: TYPOGRAPHY ── */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Select font pairings for headings, birthday letters, and storytelling cards:
            </p>

            <div>
              <label className="block text-xs font-bold text-[#38251F] mb-2 uppercase tracking-wider">
                Heading Font Family
              </label>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_FONTS.map(f => (
                  <button
                    key={`h-${f.name}`}
                    onClick={() => updateField('heading_font', f.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      currentTheme.heading_font === f.name
                        ? 'border-[#E85B32] bg-[#FFF6F0] font-bold'
                        : 'border-gray-200 bg-white hover:border-[#FFBFA8]'
                    }`}
                  >
                    <span style={{ fontFamily: f.family }} className="text-base text-[#38251F]">
                      {f.label}
                    </span>
                    {currentTheme.heading_font === f.name && (
                      <Check className="w-4 h-4 text-[#E85B32]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#38251F] mb-2 uppercase tracking-wider">
                Body & Letter Font Family
              </label>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_FONTS.map(f => (
                  <button
                    key={`b-${f.name}`}
                    onClick={() => updateField('body_font', f.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      currentTheme.body_font === f.name
                        ? 'border-[#E85B32] bg-[#FFF6F0] font-bold'
                        : 'border-gray-200 bg-white hover:border-[#FFBFA8]'
                    }`}
                  >
                    <span style={{ fontFamily: f.family }} className="text-base text-[#38251F]">
                      {f.label}
                    </span>
                    {currentTheme.body_font === f.name && (
                      <Check className="w-4 h-4 text-[#E85B32]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BACKGROUND ── */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Choose the atmosphere background style for the surprise:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BACKGROUND_TYPES.map(bg => {
                const isSelected = currentTheme.background_type === bg.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => updateField('background_type', bg.id as any)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E85B32] bg-[#FFF6F0] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-[#FFBFA8]'
                    }`}
                  >
                    <span className="text-2xl">{bg.icon}</span>
                    <span className="text-xs font-bold text-[#38251F]">{bg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 5: ANIMATIONS ── */}
        {activeTab === 'animations' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Toggle specific animation elements & adjust visual intensity:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Floating Balloons', key: 'balloons' },
                { label: 'Floating Hearts', key: 'hearts' },
                { label: 'Falling Confetti', key: 'confetti' },
                { label: 'Grand Fireworks', key: 'fireworks' },
                { label: 'Sparkles', key: 'sparkles' },
                { label: 'Starry Twinkles', key: 'stars' },
                { label: 'Typewriter Letter', key: 'typewriter' },
                { label: 'Neon Glows', key: 'glow' },
              ].map(item => {
                const isEnabled = currentTheme.animation_settings[item.key as keyof typeof currentTheme.animation_settings];
                return (
                  <button
                    key={item.key}
                    onClick={() => updateAnimField(item.key as any, !isEnabled)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isEnabled
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Intensity */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#38251F] mb-2 uppercase tracking-wider">
                Animation Intensity
              </label>
              <div className="flex items-center gap-2">
                {(['low', 'medium', 'high'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => updateAnimField('intensity', lvl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      currentTheme.animation_settings.intensity === lvl
                        ? 'border-[#E85B32] bg-[#E85B32] text-white shadow-xs'
                        : 'border-gray-200 bg-white text-[#38251F]/70'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: MUSIC ── */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Select which melodic synthesized soundtrack plays in the recipient surprise:
            </p>
            <div className="space-y-2.5">
              {MUSIC_TRACKS.map(t => {
                const isSelected = currentTheme.music_url === t.id;
                const isPlaying = previewPlayingMusic === t.id;
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#E85B32] bg-[#FFF6F0]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#38251F]">{t.title}</h4>
                      <p className="text-xs text-[#38251F]/60">{t.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewMusic(t.id)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#FFBFA8] text-xs font-bold text-[#E85B32] flex items-center gap-1 cursor-pointer hover:shadow-xs"
                      >
                        <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => {
                          updateField('music_url', t.id);
                          sound.playClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E85B32] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: LIVE INTERACTIVE PREVIEW ── */}
      <div className="w-full lg:w-5/12 sticky top-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#FFBFA8]/60 shadow-xl">
          {/* Preview Controls Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#FFBFA8]/40 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#38251F]">
              <Eye className="w-4 h-4 text-[#E85B32]" />
              <span>Real-Time Live Preview</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-[#FFF6F0] p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  previewDevice === 'desktop' ? 'bg-[#E85B32] text-white' : 'text-[#38251F]/60'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  previewDevice === 'mobile' ? 'bg-[#E85B32] text-white' : 'text-[#38251F]/60'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scene Switcher Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px]">
            {[
              { id: 'welcome', label: '1. Star' },
              { id: 'cake', label: '2. Cake' },
              { id: 'balloons', label: '3. Balloons' },
              { id: 'voice', label: '4. Voice' },
              { id: 'letter', label: '5. Letter' }
            ].map(sc => (
              <button
                key={sc.id}
                onClick={() => setPreviewScene(sc.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  previewScene === sc.id
                    ? 'bg-[#38251F] text-white'
                    : 'bg-[#FFF6F0] text-[#38251F]/70 hover:bg-[#FFBFA8]/30'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* ── LIVE PREVIEW SCREEN SIMULATOR ── */}
          <div className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-900 ${
            previewDevice === 'mobile' ? 'w-[280px] h-[480px]' : 'w-full h-[400px]'
          }`}>
            <div
              className="w-full h-full p-4 flex flex-col items-center justify-center text-center relative overflow-hidden select-none"
              style={{
                backgroundColor: currentTheme.background_color,
                color: currentTheme.text_color,
                fontFamily: currentTheme.body_font
              }}
            >
              {/* Starry dots simulation */}
              <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none opacity-40" />

              {/* SCENE PREVIEW: WELCOME */}
              {previewScene === 'welcome' && (
                <div className="space-y-3 z-10">
                  <span className="text-3xl">🎂</span>
                  <h4 
                    className="text-xl font-extrabold"
                    style={{ fontFamily: currentTheme.heading_font, color: currentTheme.text_color }}
                  >
                    Happy Birthday, {recipientName || 'Star'}!
                  </h4>
                  <p className="text-xs opacity-80" style={{ color: currentTheme.secondary_color }}>
                    From {senderName || 'Someone who loves you'}
                  </p>
                  <div
                    className="px-4 py-2 rounded-xl text-xs font-bold inline-block shadow-md text-white"
                    style={{ background: currentTheme.primary_color }}
                  >
                    Touch to Open Surprise ✨
                  </div>
                </div>
              )}

              {/* SCENE PREVIEW: CAKE */}
              {previewScene === 'cake' && (
                <div className="space-y-3 z-10 flex flex-col items-center">
                  <span className="text-4xl">🎂</span>
                  <div
                    className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white shadow-md"
                    style={{ background: currentTheme.primary_color }}
                  >
                    Make a Wish
                  </div>
                  <p className="text-[11px] opacity-75">
                    Touch cake to blow candles 🕯️
                  </p>
                </div>
              )}

              {/* SCENE PREVIEW: BALLOONS */}
              {previewScene === 'balloons' && (
                <div className="space-y-3 z-10 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-bounce">🎈</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎈</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎈</span>
                  </div>
                  <h5 className="font-bold text-xs" style={{ color: currentTheme.accent_color }}>
                    Pop the balloons!
                  </h5>
                  <div 
                    className="p-3 rounded-xl text-left text-[11px] max-w-[220px]"
                    style={{ background: currentTheme.card_background, border: `1px solid ${currentTheme.secondary_color}40` }}
                  >
                    <span className="font-bold text-[9px] block uppercase" style={{ color: currentTheme.accent_color }}>
                      Reason #1
                    </span>
                    You bring sunshine into every day ☀️
                  </div>
                </div>
              )}

              {/* SCENE PREVIEW: VOICE */}
              {previewScene === 'voice' && (
                <div 
                  className="p-4 rounded-2xl w-full max-w-[240px] z-10 text-left border"
                  style={{ 
                    background: currentTheme.card_background,
                    borderColor: `${currentTheme.secondary_color}40`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs">🎙️</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentTheme.accent_color }}>
                      Voice Note
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ background: currentTheme.primary_color }}>
                      ▶
                    </div>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full" style={{ background: currentTheme.primary_color }} />
                    </div>
                  </div>
                  <span className="text-[10px] opacity-60">From {senderName}</span>
                </div>
              )}

              {/* SCENE PREVIEW: LETTER */}
              {previewScene === 'letter' && (
                <div 
                  className="p-4 rounded-2xl w-full max-w-[230px] z-10 text-left bg-[#FFFBF0] text-[#38251F] shadow-lg border border-amber-200"
                  style={{ fontFamily: currentTheme.body_font }}
                >
                  <span className="text-[9px] uppercase font-bold text-amber-800 block mb-1">
                    Secret Birthday Letter
                  </span>
                  <p className="text-[10px] leading-relaxed line-clamp-4 italic">
                    "Dearest {recipientName || 'Friend'}, Today is all about celebrating you. Words often fall short of how much you mean to me..."
                  </p>
                  <span className="text-[9px] font-bold block text-right mt-2 text-[#E85B32]">
                    — With love, {senderName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
