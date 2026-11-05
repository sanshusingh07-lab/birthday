import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { sound } from '../../utils/audio';
import { fireCelebrationConfetti, fireFireworksSequence } from '../../utils/confetti';

interface SceneCakeProps {
  recipientName: string;
  onNext: () => void;
  onPrev: () => void;
}

/* ─── Premium Dark Chocolate Layered Cake ─────────────────────────────── */
export const SceneCake: React.FC<SceneCakeProps> = ({ recipientName, onNext, onPrev }) => {
  /**
   * Build stages:
   * 0 — Empty plate slides in
   * 1 — Bottom cake layer rises up
   * 2 — Cream layer + second cake layer stack
   * 3 — Frosting drips cascade down the sides
   * 4 — Decorations (cherries, berries) appear on top
   * 5 — 3 candles land, flames ignite with glow
   */
  const [buildStep, setBuildStep] = useState<number>(0);
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Baking something sweet…");

  /* ── Automated sequential cake build ─────────────────────────────── */
  useEffect(() => {
    const timers = [
      setTimeout(() => { setBuildStep(1); sound.playClick(); setStatusText("Stacking rich chocolate layers…"); }, 900),
      setTimeout(() => { setBuildStep(2); sound.playClick(); setStatusText("Adding luscious cream filling…"); }, 2000),
      setTimeout(() => { setBuildStep(3); sound.playSparkle(); setStatusText("Drizzling cream frosting…"); }, 3100),
      setTimeout(() => { setBuildStep(4); sound.playClick(); setStatusText("Placing fresh berries & cherries…"); }, 4200),
      setTimeout(() => {
        setBuildStep(5);
        sound.playSparkle();
        setStatusText(`Happy Birthday, ${recipientName || 'Birthday Star'}!`);
      }, 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [recipientName]);

  /* ── Blow candles handler ────────────────────────────────────────── */
  const handleBlowCandles = () => {
    if (candlesBlown || buildStep < 5) return;
    setCandlesBlown(true);
    sound.playCandleBlow();
    sound.playFanfare();
    fireCelebrationConfetti();
    fireFireworksSequence(5000);
  };

  /* ── Skip animation ─────────────────────────────────────────────── */
  const handleSkipBuild = () => {
    setBuildStep(5);
    setStatusText(`Happy Birthday, ${recipientName || 'Birthday Star'}!`);
    sound.playSparkle();
  };

  /* ════════════════════════════════════════════════════════════════════
     SVG CAKE – Premium dark chocolate illustration
     viewBox 0 0 340 440  — wide & tall for detail
     ════════════════════════════════════════════════════════════════════ */
  const CakeSVG = (
    <svg
      viewBox="0 0 340 440"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))' }}
    >
      <defs>
        {/* ── Gradients ──────────────────────────────────────────── */}
        {/* Chocolate cake body */}
        <linearGradient id="cakeBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3D1E0F" />
          <stop offset="50%" stopColor="#5C2E16" />
          <stop offset="100%" stopColor="#3D1E0F" />
        </linearGradient>
        {/* Darker chocolate for shading */}
        <linearGradient id="cakeBodyDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2512" />
          <stop offset="100%" stopColor="#2E150A" />
        </linearGradient>
        {/* Cream filling */}
        <linearGradient id="creamFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF5" />
          <stop offset="100%" stopColor="#FFF0D9" />
        </linearGradient>
        {/* Frosting drip */}
        <linearGradient id="frostDrip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF5E6" />
        </linearGradient>
        {/* Plate gradient */}
        <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8EE" />
          <stop offset="40%" stopColor="#F5E6D0" />
          <stop offset="100%" stopColor="#E8D5BB" />
        </linearGradient>
        {/* Plate rim highlight */}
        <linearGradient id="plateRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFAF0" />
          <stop offset="100%" stopColor="#F0DFC5" />
        </linearGradient>
        {/* Candle stripes */}
        <pattern id="candleStripe" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <rect width="8" height="8" fill="#FFE0E8" />
          <rect width="8" height="4" fill="#FFB6C8" />
        </pattern>
        {/* Flame gradients */}
        <radialGradient id="flameOuter" cx="0.5" cy="0.8" r="0.6">
          <stop offset="0%" stopColor="#FFEB3B" />
          <stop offset="40%" stopColor="#FFA726" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="flameInner" cx="0.5" cy="0.7" r="0.35">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FFF9C4" />
          <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0" />
        </radialGradient>
        {/* Flame glow filter */}
        <filter id="flameGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft candle glow */}
        <filter id="candleAura" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="12" result="aura" />
          <feMerge>
            <feMergeNode in="aura" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Smoke filter */}
        <filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        {/* Shadow under plate */}
        <filter id="plateShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        {/* Berry sheen */}
        <radialGradient id="cherryGrad" cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#FF3D55" />
          <stop offset="70%" stopColor="#C62828" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
        <radialGradient id="berryGrad" cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#7B1FA2" />
          <stop offset="70%" stopColor="#4A148C" />
          <stop offset="100%" stopColor="#2C0A4A" />
        </radialGradient>
      </defs>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 0 — PLATE + SHADOW (always visible)
          ═══════════════════════════════════════════════════════════════ */}
      {/* Shadow under plate */}
      <ellipse cx="170" cy="400" rx="140" ry="18" fill="#00000044" filter="url(#plateShadow)" />
      {/* Plate body */}
      <ellipse cx="170" cy="388" rx="148" ry="22" fill="url(#plateGrad)" stroke="#E0CDB5" strokeWidth="1" />
      {/* Plate rim */}
      <ellipse cx="170" cy="386" rx="138" ry="16" fill="none" stroke="url(#plateRim)" strokeWidth="2" opacity="0.6" />
      {/* Plate highlight */}
      <ellipse cx="170" cy="383" rx="90" ry="7" fill="#FFFFFF" opacity="0.18" />
      {/* Plate reflection */}
      <ellipse cx="170" cy="410" rx="100" ry="10" fill="#FFFFFF" opacity="0.06" />

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1 — BOTTOM CAKE LAYER
          ═══════════════════════════════════════════════════════════════ */}
      {buildStep >= 1 && (
        <g>
          {/* Bottom cake layer — rounded rect with chocolate gradient */}
          <rect x="60" y="300" width="220" height="82" rx="16" ry="16" fill="url(#cakeBody)" />
          {/* Side shading left */}
          <rect x="60" y="300" width="30" height="82" rx="16" ry="0" fill="#2E150A" opacity="0.25" />
          {/* Side shading right */}
          <rect x="250" y="300" width="30" height="82" rx="0" ry="16" fill="#2E150A" opacity="0.2" />
          {/* Top surface highlight */}
          <rect x="60" y="300" width="220" height="10" rx="16" ry="16" fill="#6B3820" opacity="0.3" />
          {/* Crumb texture */}
          <circle cx="100" cy="335" r="2" fill="#2E150A" opacity="0.3" />
          <circle cx="150" cy="345" r="1.5" fill="#2E150A" opacity="0.25" />
          <circle cx="210" cy="325" r="2.5" fill="#2E150A" opacity="0.2" />
          <circle cx="240" cy="355" r="1.5" fill="#2E150A" opacity="0.3" />
          <circle cx="120" cy="360" r="2" fill="#2E150A" opacity="0.2" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 2 — CREAM LAYER + SECOND CAKE LAYER ON TOP
          ═══════════════════════════════════════════════════════════════ */}
      {buildStep >= 2 && (
        <g>
          {/* Cream filling band */}
          <rect x="64" y="290" width="212" height="14" rx="4" fill="url(#creamFill)" />
          {/* Cream dots for texture */}
          <circle cx="95" cy="297" r="2.5" fill="#FFDDAA" opacity="0.5" />
          <circle cx="135" cy="296" r="2" fill="#FFDDAA" opacity="0.4" />
          <circle cx="180" cy="297" r="2.5" fill="#FFDDAA" opacity="0.5" />
          <circle cx="220" cy="296" r="2" fill="#FFDDAA" opacity="0.4" />
          <circle cx="255" cy="297" r="2.5" fill="#FFDDAA" opacity="0.45" />

          {/* Second cake layer (upper, slightly narrower) */}
          <rect x="68" y="220" width="204" height="74" rx="14" ry="14" fill="url(#cakeBody)" />
          {/* Side shading */}
          <rect x="68" y="220" width="26" height="74" rx="14" ry="0" fill="#2E150A" opacity="0.22" />
          <rect x="246" y="220" width="26" height="74" rx="0" ry="14" fill="#2E150A" opacity="0.18" />
          {/* Top surface */}
          <rect x="68" y="220" width="204" height="10" rx="14" ry="14" fill="#6B3820" opacity="0.25" />
          {/* Crumbs */}
          <circle cx="110" cy="250" r="2" fill="#2E150A" opacity="0.25" />
          <circle cx="160" cy="260" r="1.5" fill="#2E150A" opacity="0.2" />
          <circle cx="230" cy="245" r="2" fill="#2E150A" opacity="0.25" />

          {/* Second cream band on top of upper layer */}
          <rect x="72" y="212" width="196" height="12" rx="4" fill="url(#creamFill)" />
          <circle cx="110" cy="218" r="2" fill="#FFDDAA" opacity="0.45" />
          <circle cx="160" cy="218" r="2.5" fill="#FFDDAA" opacity="0.5" />
          <circle cx="210" cy="218" r="2" fill="#FFDDAA" opacity="0.45" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3 — FROSTING DRIPS DOWN THE SIDES
          ═══════════════════════════════════════════════════════════════ */}
      {buildStep >= 3 && (
        <g>
          {/* Top frosting cap */}
          <rect x="72" y="206" width="196" height="14" rx="7" fill="url(#frostDrip)" />
          <ellipse cx="170" cy="208" rx="90" ry="4" fill="#FFFFFF" opacity="0.25" />

          {/* Organic drips — left side */}
          <path d="M78,218 Q76,240 80,260 Q84,270 82,265" fill="url(#frostDrip)" />
          <path d="M94,216 Q90,248 96,280 Q100,292 97,286" fill="url(#frostDrip)" />
          <path d="M112,215 Q108,250 114,295 Q118,308 115,300" fill="url(#frostDrip)" />

          {/* Organic drips — center */}
          <path d="M138,214 Q134,255 140,310 Q144,326 141,318" fill="url(#frostDrip)" />
          <path d="M162,214 Q157,240 162,275 Q166,288 163,282" fill="url(#frostDrip)" />
          <path d="M182,214 Q178,260 184,320 Q188,335 185,326" fill="url(#frostDrip)" />

          {/* Organic drips — right side */}
          <path d="M204,215 Q200,248 206,290 Q210,302 207,295" fill="url(#frostDrip)" />
          <path d="M226,216 Q222,245 228,278 Q232,290 229,283" fill="url(#frostDrip)" />
          <path d="M248,217 Q244,242 250,268 Q254,278 251,272" fill="url(#frostDrip)" />
          <path d="M260,218 Q257,234 262,252 Q265,259 263,255" fill="url(#frostDrip)" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4 — DECORATIONS: Cherries & berries on top
          ═══════════════════════════════════════════════════════════════ */}
      {buildStep >= 4 && (
        <g>
          {/* Cherry 1 */}
          <circle cx="118" cy="207" r="9" fill="url(#cherryGrad)" />
          <ellipse cx="115" cy="203" rx="3" ry="2" fill="#FF8A80" opacity="0.5" />
          {/* Cherry stem */}
          <path d="M118,198 Q122,188 128,186" stroke="#2E7D32" strokeWidth="1.5" fill="none" />
          <ellipse cx="129" cy="185" rx="4" ry="2.5" fill="#388E3C" />

          {/* Cherry 2 */}
          <circle cx="222" cy="207" r="9" fill="url(#cherryGrad)" />
          <ellipse cx="219" cy="203" rx="3" ry="2" fill="#FF8A80" opacity="0.5" />
          <path d="M222,198 Q218,188 212,186" stroke="#2E7D32" strokeWidth="1.5" fill="none" />
          <ellipse cx="211" cy="185" rx="4" ry="2.5" fill="#388E3C" />

          {/* Blueberry cluster - left */}
          <circle cx="98" cy="210" r="6" fill="url(#berryGrad)" />
          <ellipse cx="96" cy="207" rx="2" ry="1.2" fill="#CE93D8" opacity="0.4" />
          <circle cx="105" cy="213" r="5" fill="url(#berryGrad)" />

          {/* Blueberry cluster - right */}
          <circle cx="242" cy="210" r="6" fill="url(#berryGrad)" />
          <ellipse cx="240" cy="207" rx="2" ry="1.2" fill="#CE93D8" opacity="0.4" />
          <circle cx="235" cy="213" r="5" fill="url(#berryGrad)" />

          {/* Small gold decoration dots on frosting */}
          <circle cx="145" cy="210" r="3" fill="#FFD54F" opacity="0.7" />
          <circle cx="195" cy="210" r="3" fill="#FFD54F" opacity="0.7" />
          <circle cx="170" cy="209" r="2.5" fill="#FFD54F" opacity="0.5" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5 — THREE CANDLES WITH FLICKERING FLAMES
          ═══════════════════════════════════════════════════════════════ */}
      {buildStep >= 5 && (
        <g>
          {/* ── CANDLE LEFT ──────────────────────────────────────── */}
          <g>
            {/* Candle stick */}
            <rect x="118" y="152" width="10" height="52" rx="3" fill="url(#candleStripe)" />
            <rect x="118" y="152" width="10" height="52" rx="3" fill="url(#candleStripe)" stroke="#FFB6C8" strokeWidth="0.5" />
            {/* Wick */}
            <line x1="123" y1="152" x2="123" y2="143" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />

            {!candlesBlown ? (
              <g filter="url(#flameGlow)">
                {/* Warm aura */}
                <ellipse cx="123" cy="136" rx="14" ry="18" fill="#FFA726" opacity="0.12" filter="url(#candleAura)" />
                {/* Outer flame */}
                <path d="M123,118 Q128,126 127,134 Q126,140 123,142 Q120,140 119,134 Q118,126 123,118Z" fill="url(#flameOuter)">
                  <animate attributeName="d" dur="0.4s" repeatCount="indefinite" values="
                    M123,118 Q128,126 127,134 Q126,140 123,142 Q120,140 119,134 Q118,126 123,118Z;
                    M123,116 Q129,125 128,133 Q126,141 123,143 Q120,141 118,133 Q117,125 123,116Z;
                    M123,119 Q127,127 126,135 Q125,140 123,141 Q121,140 120,135 Q119,127 123,119Z;
                    M123,118 Q128,126 127,134 Q126,140 123,142 Q120,140 119,134 Q118,126 123,118Z
                  " />
                </path>
                {/* Inner bright core */}
                <path d="M123,128 Q125,132 124,137 Q123.5,140 123,141 Q122.5,140 122,137 Q121,132 123,128Z" fill="url(#flameInner)">
                  <animate attributeName="d" dur="0.35s" repeatCount="indefinite" values="
                    M123,128 Q125,132 124,137 Q123.5,140 123,141 Q122.5,140 122,137 Q121,132 123,128Z;
                    M123,127 Q126,131 125,136 Q124,140 123,141 Q122,140 121,136 Q120,131 123,127Z;
                    M123,129 Q125,133 124,138 Q123.5,140 123,141 Q122.5,140 122,138 Q121,133 123,129Z;
                    M123,128 Q125,132 124,137 Q123.5,140 123,141 Q122.5,140 122,137 Q121,132 123,128Z
                  " />
                </path>
              </g>
            ) : (
              /* Smoke wisp */
              <g filter="url(#smokeBlur)">
                <path d="M123,143 Q121,135 123,128 Q125,122 122,115" stroke="#9E9E9E" strokeWidth="2" fill="none" opacity="0.4">
                  <animate attributeName="opacity" dur="2s" values="0.4;0.1;0" fill="freeze" />
                  <animate attributeName="d" dur="2s" values="
                    M123,143 Q121,135 123,128 Q125,122 122,115;
                    M123,143 Q120,130 124,120 Q126,110 121,100
                  " fill="freeze" />
                </path>
              </g>
            )}
          </g>

          {/* ── CANDLE CENTER ────────────────────────────────────── */}
          <g>
            <rect x="165" y="140" width="10" height="64" rx="3" fill="url(#candleStripe)" stroke="#FFB6C8" strokeWidth="0.5" />
            <line x1="170" y1="140" x2="170" y2="130" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />

            {!candlesBlown ? (
              <g filter="url(#flameGlow)">
                <ellipse cx="170" cy="122" rx="16" ry="20" fill="#FFA726" opacity="0.12" filter="url(#candleAura)" />
                <path d="M170,103 Q176,113 175,122 Q173,129 170,131 Q167,129 165,122 Q164,113 170,103Z" fill="url(#flameOuter)">
                  <animate attributeName="d" dur="0.45s" repeatCount="indefinite" values="
                    M170,103 Q176,113 175,122 Q173,129 170,131 Q167,129 165,122 Q164,113 170,103Z;
                    M170,101 Q177,112 176,121 Q174,130 170,132 Q166,130 164,121 Q163,112 170,101Z;
                    M170,105 Q175,114 174,123 Q173,128 170,130 Q167,128 166,123 Q165,114 170,105Z;
                    M170,103 Q176,113 175,122 Q173,129 170,131 Q167,129 165,122 Q164,113 170,103Z
                  " />
                </path>
                <path d="M170,115 Q172,120 171,126 Q170.5,129 170,130 Q169.5,129 169,126 Q168,120 170,115Z" fill="url(#flameInner)">
                  <animate attributeName="d" dur="0.3s" repeatCount="indefinite" values="
                    M170,115 Q172,120 171,126 Q170.5,129 170,130 Q169.5,129 169,126 Q168,120 170,115Z;
                    M170,113 Q173,119 172,125 Q171,129 170,130 Q169,129 168,125 Q167,119 170,113Z;
                    M170,116 Q172,121 171,127 Q170.5,129 170,130 Q169.5,129 169,127 Q168,121 170,116Z;
                    M170,115 Q172,120 171,126 Q170.5,129 170,130 Q169.5,129 169,126 Q168,120 170,115Z
                  " />
                </path>
              </g>
            ) : (
              <g filter="url(#smokeBlur)">
                <path d="M170,131 Q168,122 170,115 Q172,108 169,100" stroke="#9E9E9E" strokeWidth="2" fill="none" opacity="0.4">
                  <animate attributeName="opacity" dur="2s" values="0.4;0.1;0" fill="freeze" />
                  <animate attributeName="d" dur="2s" values="
                    M170,131 Q168,122 170,115 Q172,108 169,100;
                    M170,131 Q167,118 171,105 Q173,95 168,82
                  " fill="freeze" />
                </path>
              </g>
            )}
          </g>

          {/* ── CANDLE RIGHT ─────────────────────────────────────── */}
          <g>
            <rect x="212" y="152" width="10" height="52" rx="3" fill="url(#candleStripe)" stroke="#FFB6C8" strokeWidth="0.5" />
            <line x1="217" y1="152" x2="217" y2="143" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />

            {!candlesBlown ? (
              <g filter="url(#flameGlow)">
                <ellipse cx="217" cy="136" rx="14" ry="18" fill="#FFA726" opacity="0.12" filter="url(#candleAura)" />
                <path d="M217,118 Q222,126 221,134 Q220,140 217,142 Q214,140 213,134 Q212,126 217,118Z" fill="url(#flameOuter)">
                  <animate attributeName="d" dur="0.42s" repeatCount="indefinite" values="
                    M217,118 Q222,126 221,134 Q220,140 217,142 Q214,140 213,134 Q212,126 217,118Z;
                    M217,116 Q223,125 222,133 Q220,141 217,143 Q214,141 212,133 Q211,125 217,116Z;
                    M217,119 Q221,127 220,135 Q219,140 217,141 Q215,140 214,135 Q213,127 217,119Z;
                    M217,118 Q222,126 221,134 Q220,140 217,142 Q214,140 213,134 Q212,126 217,118Z
                  " />
                </path>
                <path d="M217,128 Q219,132 218,137 Q217.5,140 217,141 Q216.5,140 216,137 Q215,132 217,128Z" fill="url(#flameInner)">
                  <animate attributeName="d" dur="0.38s" repeatCount="indefinite" values="
                    M217,128 Q219,132 218,137 Q217.5,140 217,141 Q216.5,140 216,137 Q215,132 217,128Z;
                    M217,127 Q220,131 219,136 Q218,140 217,141 Q216,140 215,136 Q214,131 217,127Z;
                    M217,129 Q219,133 218,138 Q217.5,140 217,141 Q216.5,140 216,138 Q215,133 217,129Z;
                    M217,128 Q219,132 218,137 Q217.5,140 217,141 Q216.5,140 216,137 Q215,132 217,128Z
                  " />
                </path>
              </g>
            ) : (
              <g filter="url(#smokeBlur)">
                <path d="M217,143 Q215,135 217,128 Q219,122 216,115" stroke="#9E9E9E" strokeWidth="2" fill="none" opacity="0.4">
                  <animate attributeName="opacity" dur="2s" values="0.4;0.1;0" fill="freeze" />
                  <animate attributeName="d" dur="2s" values="
                    M217,143 Q215,135 217,128 Q219,122 216,115;
                    M217,143 Q214,130 218,120 Q220,110 215,100
                  " fill="freeze" />
                </path>
              </g>
            )}
          </g>
        </g>
      )}
    </svg>
  );

  /* ════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-6 z-10 relative">

      {/* ── Top Header Badge ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <span className="font-serif text-lg sm:text-xl text-[#FFBFA8] font-bold tracking-wide flex items-center justify-center gap-2">
          <span>First things first</span>
          <span>🎂</span>
        </span>
      </motion.div>

      {/* ── Status Heading ───────────────────────────────────────── */}
      <div className="min-h-[3rem] mb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={statusText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,191,168,0.4)]"
          >
            {statusText}
          </motion.h2>
        </AnimatePresence>
        <p className="text-xs sm:text-sm text-[#FFD166] mt-1 font-medium">
          {buildStep < 5
            ? "Watch your cake being freshly made…"
            : candlesBlown
            ? "✨ Wish sent to the universe! ✨"
            : "Make a wish & touch the cake to blow out the candles 🕯️"}
        </p>
      </div>

      {/* ── Cake Canvas ──────────────────────────────────────────── */}
      <div
        onClick={handleBlowCandles}
        className="relative w-[340px] sm:w-[400px] h-[440px] sm:h-[500px] mx-auto flex items-center justify-center cursor-pointer group select-none"
        title={buildStep >= 5 && !candlesBlown ? "Tap to blow candles!" : ""}
      >
        {/* Warm background aura */}
        <div className="absolute inset-0 bg-radial from-[#FFBFA8]/20 via-[#E85B32]/10 to-transparent blur-3xl pointer-events-none" />

        {/* ── Plate slides in (Stage 0) ────────────────────────── */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="w-full h-full"
        >
          {/* ── Bottom Layer (Stage 1) ───────────────────────── */}
          <AnimatePresence>
            {buildStep >= 1 ? (
              <motion.div
                initial={{ y: 60, opacity: 0, scaleY: 0.5 }}
                animate={{ y: 0, opacity: 1, scaleY: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="absolute inset-0"
              >
                {/* ── Cream + Second Layer (Stage 2) ────────── */}
                <AnimatePresence>
                  {buildStep >= 2 ? (
                    <motion.div
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.1 }}
                      className="absolute inset-0"
                    >
                      {/* ── Frosting Drips (Stage 3) ──────── */}
                      <AnimatePresence>
                        {buildStep >= 3 ? (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0"
                          >
                            {/* ── Decorations (Stage 4) ── */}
                            <AnimatePresence>
                              {buildStep >= 4 ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                                  className="absolute inset-0"
                                >
                                  {/* ── Candles (Stage 5) ── */}
                                  <AnimatePresence>
                                    {buildStep >= 5 ? (
                                      <motion.div
                                        initial={{ y: -80, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="absolute inset-0"
                                      >
                                        {CakeSVG}
                                      </motion.div>
                                    ) : (
                                      /* Render without candles */
                                      <div className="absolute inset-0">{CakeSVG}</div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              ) : (
                                /* Render without decorations */
                                <div className="absolute inset-0">{CakeSVG}</div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          /* Render without drips */
                          <div className="absolute inset-0">{CakeSVG}</div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    /* Render with only bottom layer */
                    <div className="absolute inset-0">{CakeSVG}</div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Render plate only */
              <div className="absolute inset-0">{CakeSVG}</div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── "MAKE A WISH" pill button overlaid on cake body ──── */}
        {buildStep >= 5 && !candlesBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 14 }}
            className="absolute z-50"
            style={{ top: '64%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleBlowCandles(); }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="px-7 py-2.5 rounded-full text-white font-bold text-sm tracking-widest uppercase shadow-lg cursor-pointer border-2 border-white/30"
              style={{
                background: 'linear-gradient(135deg, #E85B32 0%, #FF7043 50%, #E85B32 100%)',
                boxShadow: '0 4px 20px rgba(232, 91, 50, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Make a Wish
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* After candles blown — sparkle feedback on cake */}
        {candlesBlown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute z-50"
            style={{ top: '64%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <span className="px-5 py-2 rounded-full bg-white/15 border border-white/25 text-[#FFD166] font-bold text-xs tracking-wider backdrop-blur-sm shadow-lg">
              ✨ Wish Granted! ✨
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Skip Build Button ────────────────────────────────────── */}
      {buildStep < 5 && (
        <button
          onClick={handleSkipBuild}
          className="text-xs text-white/50 hover:text-white underline transition-colors cursor-pointer mb-4 mt-2"
        >
          Skip animation & light candles
        </button>
      )}

      {/* ── Prompt below cake ────────────────────────────────────── */}
      {buildStep >= 5 && (
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="mb-6 mt-2"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#FFD166] text-xs font-bold shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {candlesBlown
                ? "✨ Candle blown! Ready to pop your balloons ✨"
                : "Touch Cake to Blow Candles & Make Your Wish!"}
            </span>
          </span>
        </motion.div>
      )}

      {/* ── Navigation Buttons ───────────────────────────────────── */}
      <div className="flex items-center justify-between w-full max-w-xl mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous: Reveal</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-sm font-bold shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Touch To Go To Next Page: Pop Balloons 🎈</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
