import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { uploadTempVoice } from '../../utils/api';
import type { VoiceMessageData } from '../../types/birthday';

interface VoiceRecorderProps {
  initialVoice?: VoiceMessageData | null;
  senderName: string;
  recipientName: string;
  onVoiceChange: (voice: VoiceMessageData | null) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  initialVoice,
  senderName,
  recipientName,
  onVoiceChange
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialVoice?.audio_url || null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(initialVoice?.duration || 0);
  const [voiceTitle, setVoiceTitle] = useState<string>(
    initialVoice?.title || `A special message from ${senderName || 'Someone who loves you'} ❤️`
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_DURATION = 180; // 3 minutes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopAudioContext();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_DURATION - 1) {
          handleStopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const stopAudioContext = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Helper to convert blob to permanent base64 Data URL
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start live visualizer
  const setupVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);

          // Beautiful gradient bar
          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#E85B32');
          gradient.addColorStop(0.5, '#FF80AB');
          gradient.addColorStop(1, '#FFD166');

          canvasCtx.fillStyle = gradient;
          const roundedRadius = 3;
          const y = (canvas.height - barHeight) / 2;

          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth - 2, barHeight || 4, roundedRadius);
          canvasCtx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn("Visualizer init notice:", err);
    }
  };

  // Trigger visualizer when canvas mounts while recording
  useEffect(() => {
    if (isRecording && streamRef.current) {
      const timer = setTimeout(() => {
        if (streamRef.current) {
          setupVisualizer(streamRef.current);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    setErrorMsg(null);
    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Your browser does not support microphone recording or is running in an insecure HTTP context. Please open using HTTPS or upload an audio file below.");
      setHasMicPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasMicPermission(true);

      let mimeType = '';
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg'
      ];
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const type of candidateTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualType = mimeType || 'audio/webm';
        const recordedBlob = new Blob(audioChunksRef.current, { type: actualType });
        setAudioBlob(recordedBlob);
        const recordedUrl = URL.createObjectURL(recordedBlob);
        setAudioUrl(recordedUrl);
        setDuration(recordingTime);

        // Convert to base64 Data URL first for permanent reliability across devices
        let base64Audio = '';
        try {
          base64Audio = await blobToBase64(recordedBlob);
        } catch (b64Err) {
          console.warn("Failed base64 conversion:", b64Err);
        }

        // Upload to backend
        setIsUploading(true);
        try {
          const res = await uploadTempVoice(recordedBlob, recordingTime, voiceTitle);
          setAudioUrl(res.audio_url);
          onVoiceChange(res);
        } catch (uploadErr: any) {
          console.warn("Upload fallback using base64 persistence:", uploadErr);
          const persistentUrl = base64Audio || recordedUrl;
          setAudioUrl(persistentUrl);
          onVoiceChange({
            audio_url: persistentUrl,
            audio_format: actualType,
            duration: recordingTime,
            title: voiceTitle
          });
        } finally {
          setIsUploading(false);
        }

        stopAudioContext();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      startTimer();
    } catch (err: any) {
      setHasMicPermission(false);
      setErrorMsg("Microphone access was denied or not found. Please allow microphone permissions in your browser or upload an existing audio file below.");
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    stopTimer();
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleResetRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setDuration(0);
    setIsPlaying(false);
    onVoiceChange(null);
  };

  // Upload an existing audio file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);
    try {
      let base64Audio = '';
      try {
        base64Audio = await blobToBase64(file);
      } catch (e) {}

      const localUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(localUrl);
      
      tempAudio.onloadedmetadata = async () => {
        const fileDuration = Math.round(tempAudio.duration) || 0;
        setDuration(fileDuration);
        
        try {
          const res = await uploadTempVoice(file, fileDuration, voiceTitle);
          setAudioUrl(res.audio_url);
          onVoiceChange(res);
        } catch (err: any) {
          const persistentUrl = base64Audio || localUrl;
          setAudioUrl(persistentUrl);
          onVoiceChange({
            audio_url: persistentUrl,
            audio_format: file.type || 'audio/mp3',
            duration: fileDuration,
            title: voiceTitle
          });
        } finally {
          setIsUploading(false);
        }
      };
    } catch (err: any) {
      setErrorMsg("Failed to load audio file: " + err.message);
      setIsUploading(false);
    }
  };

  // Playback control with promise safety
  const togglePlay = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Audio play prevented:", err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hidden audio element for preview */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Glass Card */}
      <div className="bg-[#FFF6F0]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#FFBFA8]/60 shadow-xl relative overflow-hidden">
        {/* Soft aura glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#FFBFA8]/20 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E85B32]/10 border border-[#E85B32]/25 text-[#E85B32] text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Message Studio</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#38251F]">
            Record a Personal Birthday Audio
          </h3>
          <p className="text-xs sm:text-sm text-[#38251F]/70 mt-1 max-w-md mx-auto">
            Say what’s in your heart. Hearing your voice makes their birthday unforgettable.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message Title Input */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#38251F]/80 uppercase tracking-wider mb-1.5">
            Voice Note Title
          </label>
          <input
            type="text"
            value={voiceTitle}
            onChange={(e) => {
              setVoiceTitle(e.target.value);
              if (audioUrl) {
                onVoiceChange({
                  audio_url: audioUrl,
                  duration,
                  title: e.target.value
                });
              }
            }}
            placeholder="e.g. Happy 21st, Maya! (Listen till the end ❤️)"
            className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-[#FFBFA8] focus:border-[#E85B32] focus:ring-2 focus:ring-[#E85B32]/20 text-sm font-medium text-[#38251F] placeholder-[#38251F]/40 outline-none transition-all"
          />
        </div>

        {/* ── STATE 1: NOT RECORDING & NO AUDIO RECORDED YET ── */}
        {!isRecording && !audioUrl && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-[#FFBFA8] rounded-2xl bg-white/40">
            {/* Big Mic Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center shadow-xl shadow-[#E85B32]/30 hover:shadow-2xl transition-all cursor-pointer group mb-4"
            >
              <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </motion.button>

            <h4 className="font-bold text-[#38251F] text-base mb-1">
              Tap Microphone to Start Recording
            </h4>
            <p className="text-xs text-[#38251F]/60 max-w-xs mb-5">
              Maximum 3 minutes. Make sure your browser allows microphone access.
            </p>

            {/* Alternative: Upload audio */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#38251F]/40 font-semibold">— OR —</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 rounded-full bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#E85B32] flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio File</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 2: CURRENTLY RECORDING ── */}
        {isRecording && (
          <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-white/80 border border-[#E85B32]/40 shadow-inner">
            {/* Recording badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                {isPaused ? "Recording Paused" : "Recording Live..."}
              </span>
            </div>

            {/* Timer */}
            <div className="font-mono text-4xl sm:text-5xl font-black text-[#38251F] mb-4 tracking-wider">
              {formatTime(recordingTime)}
              <span className="text-xs font-normal text-[#38251F]/50 ml-2">/ 03:00</span>
            </div>

            {/* Realtime Canvas Waveform */}
            <div className="w-full h-20 bg-white/60 rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-[#FFBFA8]/40">
              <canvas
                ref={canvasRef}
                width={360}
                height={80}
                className="w-full h-full"
              />
            </div>

            {/* Action buttons during recording */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePauseResume}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#38251F] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {isPaused ? <Play className="w-4 h-4 text-[#E85B32]" /> : <Pause className="w-4 h-4 text-[#E85B32]" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                onClick={handleStopRecording}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#E85B32] to-[#FF80AB] hover:from-[#d44e26] hover:to-[#e85b7b] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#E85B32]/30 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Done Recording</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: RECORDED AUDIO PREVIEW & CONTROLS ── */}
        {!isRecording && audioUrl && (
          <div className="p-6 rounded-2xl bg-white/90 border border-emerald-500/30 shadow-md">
            {/* Success badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Voice Message Ready!
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#38251F]/60">
                {formatTime(duration)}
              </span>
            </div>

            {/* Custom Audio Player UI */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF6F0] to-[#FFEBE5] border border-[#FFBFA8]/60 flex items-center gap-4 mb-5">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
              </button>

              {/* Progress Bar & Waveform illusion */}
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-mono text-[#38251F]/70 mb-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div 
                  className="w-full h-2 rounded-full bg-[#FFBFA8]/50 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (!audioPlayerRef.current || !duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    audioPlayerRef.current.currentTime = pos * duration;
                  }}
                >
                  <div
                    className="h-full bg-[#E85B32] transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Re-record / Delete / Upload different */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#FFBFA8]/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartRecording}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#38251F] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#E85B32]" />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#38251F] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E85B32]" />
                  <span>Replace with File</span>
                </button>
              </div>

              <button
                onClick={handleResetRecording}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Voice</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

