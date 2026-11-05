// Web Audio API Sound Generator & Synthesizer with Multi-Track Selection

export type MusicTrackId = 'happy-birthday' | 'dreamy-ambient' | 'starlight-waltz' | 'cheerful-celebration';

export interface MusicTrackInfo {
  id: MusicTrackId;
  title: string;
  emoji: string;
  description: string;
}

export const MUSIC_TRACKS: MusicTrackInfo[] = [
  {
    id: 'happy-birthday',
    title: 'Happy Birthday Music Box',
    emoji: '🎂',
    description: 'Iconic Happy Birthday tune played on sweet celestial bells'
  },
  {
    id: 'dreamy-ambient',
    title: 'Dreamy Piano & Bells',
    emoji: '🎹',
    description: 'Heartwarming, romantic polyphonic chords with gentle arpeggios'
  },
  {
    id: 'starlight-waltz',
    title: 'Magical Starlight Waltz',
    emoji: '✨',
    description: 'Gentle, enchanting 3/4 waltz with shimmering harp harmonics'
  },
  {
    id: 'cheerful-celebration',
    title: 'Joyful Party Melody',
    emoji: '🎉',
    description: 'Uplifting, bright and festive celebratory melody'
  }
];

class SoundController {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private currentTrack: MusicTrackId = 'happy-birthday';
  private trackInterval: any = null;
  private isMuted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setTrack(trackId: MusicTrackId) {
    this.currentTrack = trackId;
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic(trackId);
    }
  }

  public getTrack(): MusicTrackId {
    return this.currentTrack;
  }

  // Realistic Balloon Pop Sound
  public playBalloonPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 1. Noise burst for initial pop tear
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.08);

      // 2. Low resonant thump for air expansion
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio pop playback error:", e);
    }
  }

  // Candle blowing air whoosh + magical chime
  public playCandleBlow() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Soft air whoosh
      const bufferSize = ctx.sampleRate * 0.35;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.35);

      // Followed by celebratory chime
      setTimeout(() => this.playSparkle(), 150);
    } catch (e) {
      // ignore
    }
  }

  // Envelope opening paper rustle and wax seal crack
  public playEnvelopeOpen() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Crack snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);

      // Paper slide sparkle
      setTimeout(() => this.playSparkle(), 100);
    } catch (e) {
      // ignore
    }
  }

  // Magical Chime / Sparkle Sound
  public playSparkle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.65);
      });
    } catch (e) {
      console.warn("Audio sparkle error:", e);
    }
  }

  // Celebration Fanfare
  public playFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const chord = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.1 }, // E5
        { f: 783.99, t: 0.2 }, // G5
        { f: 1046.50, t: 0.35 }, // C6
        { f: 1318.51, t: 0.5 } // E6
      ];

      chord.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + t);

        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.22, now + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 1.25);
      });
    } catch (e) {
      console.warn("Audio fanfare error:", e);
    }
  }

  // Subtle button click
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {
      // ignore
    }
  }

  // Background Music Synthesizer Engine
  public startBackgroundMusic(trackId?: MusicTrackId) {
    if (trackId) {
      this.currentTrack = trackId;
    }
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    }

    try {
      const ctx = this.getContext();
      this.isMusicPlaying = true;

      this.musicGainNode = ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.22, ctx.currentTime);
      this.musicGainNode.connect(ctx.destination);

      if (this.currentTrack === 'happy-birthday') {
        this.startHappyBirthdayLoop();
      } else if (this.currentTrack === 'starlight-waltz') {
        this.startStarlightWaltzLoop();
      } else if (this.currentTrack === 'cheerful-celebration') {
        this.startCheerfulCelebrationLoop();
      } else {
        this.startDreamyAmbientLoop();
      }
    } catch (e) {
      console.warn("Background music start error:", e);
    }
  }

  // Track 1: "Happy Birthday To You" Music Box Melodic Loop
  private startHappyBirthdayLoop() {
    const ctx = this.getContext();
    // Notes: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25
    // Melody timings (note, duration in seconds)
    const melody: { f: number; d: number }[] = [
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.0 },
      { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.5 }
    ];

    const playTune = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;
      let timeOffset = 0;

      melody.forEach(note => {
        if (!this.ctx || !this.musicGainNode) return;
        const now = this.ctx.currentTime + timeOffset;

        // Music Box Bell Oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f * 2, now); // 1 octave higher for music box sparkle

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.d * 1.1);

        osc.connect(gain);
        gain.connect(this.musicGainNode);

        osc.start(now);
        osc.stop(now + note.d * 1.15);

        // Soft accompanying harmonic
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(note.f, now);
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.04, now + 0.03);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + note.d * 0.9);

        subOsc.connect(subGain);
        subGain.connect(this.musicGainNode);
        subOsc.start(now);
        subOsc.stop(now + note.d);

        timeOffset += note.d;
      });
    };

    playTune();
    // Total duration is approx ~18 seconds, repeat loop
    this.trackInterval = setInterval(playTune, 19000);
  }

  // Track 2: Dreamy Ambient Piano Progression
  private startDreamyAmbientLoop() {
    const chords = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [392.00, 493.88, 587.33, 659.25], // G6
      [329.63, 392.00, 493.88, 587.33], // Em7
      [440.00, 523.25, 659.25, 783.99], // Am7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.musicGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.musicGainNode);

        osc.start(now);
        osc.stop(now + 3.9);
      });

      // Arpeggio sparkle
      const melodyNote = chord[Math.floor(Math.random() * chord.length)] * 2;
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(melodyNote, now + 0.6);

      melGain.gain.setValueAtTime(0.001, now + 0.6);
      melGain.gain.linearRampToValueAtTime(0.05, now + 0.75);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      melOsc.connect(melGain);
      melGain.connect(this.musicGainNode);

      melOsc.start(now + 0.6);
      melOsc.stop(now + 2.3);
    };

    playChord();
    this.trackInterval = setInterval(playChord, 3800);
  }

  // Track 3: Magical Starlight Waltz (3/4 time)
  private startStarlightWaltzLoop() {
    const waltzChords = [
      { bass: 261.63, chord: [329.63, 392.00, 523.25] }, // C
      { bass: 220.00, chord: [261.63, 329.63, 440.00] }, // Am
      { bass: 174.61, chord: [220.00, 261.63, 349.23] }, // F
      { bass: 196.00, chord: [246.94, 293.66, 392.00] }, // G
    ];
    let waltzIdx = 0;

    const playWaltzMeasure = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;
      const now = this.ctx.currentTime;
      const item = waltzChords[waltzIdx % waltzChords.length];
      waltzIdx++;

      // Beat 1: Warm Bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(item.bass, now);
      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGainNode);
      bassOsc.start(now);
      bassOsc.stop(now + 1.25);

      // Beat 2 & Beat 3: Chord chimes
      [0.6, 1.2].forEach(offset => {
        if (!this.ctx || !this.musicGainNode) return;
        item.chord.forEach(f => {
          if (!this.ctx || !this.musicGainNode) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + offset);
          gain.gain.setValueAtTime(0.04, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.5);
          osc.connect(gain);
          gain.connect(this.musicGainNode);
          osc.start(now + offset);
          osc.stop(now + offset + 0.55);
        });
      });
    };

    playWaltzMeasure();
    this.trackInterval = setInterval(playWaltzMeasure, 2000);
  }

  // Track 4: Joyful Celebration Groove
  private startCheerfulCelebrationLoop() {
    const progression = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    let step = 0;

    const playCelebrationBeat = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;
      const now = this.ctx.currentTime;
      const freq = progression[step % progression.length];
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + 0.65);
    };

    playCelebrationBeat();
    this.trackInterval = setInterval(playCelebrationBeat, 600);
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.trackInterval) {
      clearInterval(this.trackInterval);
      this.trackInterval = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic(this.currentTrack);
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }
}

export const sound = new SoundController();
