import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  Square, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Zap, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { Challenge, ChaosModifier } from '../types.js';
import { WaveformCanvas } from '../components/WaveformCanvas.js';
import { AudioRecorder, AudioRecordingResult } from '../utils/audioRecorder.js';
import { playChallengeSample, stopChallengeAudio } from '../utils/challengeSynthesizer.js';
import { 
  playCountdownChime, 
  playRecordingStart, 
  playRecordingStop, 
  playClick 
} from '../utils/soundEffects.js';

interface GameRoundViewProps {
  roundNumber: number;
  totalRounds: number;
  challenge: Challenge;
  chaosModifier?: ChaosModifier;
  onSubmitPerformance: (audioBase64?: string, duration?: number) => void;
  onMicError: () => void;
}

type Stage = 'LISTEN' | 'COUNTDOWN' | 'RECORDING' | 'PREVIEW' | 'EVALUATING';

export const GameRoundView: React.FC<GameRoundViewProps> = ({
  roundNumber,
  totalRounds,
  challenge,
  chaosModifier,
  onSubmitPerformance,
  onMicError
}) => {
  const [stage, setStage] = useState<Stage>('LISTEN');
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(challenge.duration || 4);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [recordingResult, setRecordingResult] = useState<AudioRecordingResult | null>(null);

  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const timerIntervalRef = useRef<number | null>(null);

  // Stop sample audio if component unmounts
  useEffect(() => {
    return () => {
      stopChallengeAudio();
      recorderRef.current.cancelRecording();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Listen to sample
  const handlePlaySample = () => {
    playClick();
    setIsPlayingSample(true);
    playChallengeSample(
      challenge, 
      chaosModifier, 
      () => setIsPlayingSample(true),
      () => setIsPlayingSample(false)
    );
  };

  // Start countdown sequence
  const startPerformance = async () => {
    stopChallengeAudio();
    setIsPlayingSample(false);

    // Verify mic permission first
    const hasPerm = await recorderRef.current.requestPermission();
    if (!hasPerm) {
      onMicError();
      return;
    }

    setStage('COUNTDOWN');
    setCountdown(3);
    playCountdownChime(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdownChime(count);
      } else {
        clearInterval(interval);
        beginRecording();
      }
    }, 1000);
  };

  // Begin recording
  const beginRecording = async () => {
    try {
      const liveAnalyser = await recorderRef.current.startRecording();
      setAnalyser(liveAnalyser);
      setStage('RECORDING');
      playRecordingStart();

      const duration = challenge.duration || 4;
      setRecordingTimeLeft(duration);

      let timeLeft = duration;
      timerIntervalRef.current = window.setInterval(() => {
        timeLeft -= 0.1;
        setRecordingTimeLeft(Math.max(0, parseFloat(timeLeft.toFixed(1))));

        if (timeLeft <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          stopAndFinishRecording();
        }
      }, 100);
    } catch (err) {
      console.error('Recording start error:', err);
      onMicError();
    }
  };

  // Stop recording
  const stopAndFinishRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    playRecordingStop();

    try {
      const result = await recorderRef.current.stopRecording();
      setAnalyser(null);
      setRecordingResult(result);
      setStage('PREVIEW');
    } catch (err) {
      console.error('Recording stop error:', err);
      setStage('LISTEN');
    }
  };

  // Retry
  const handleRetry = () => {
    playClick();
    recorderRef.current.cancelRecording();
    setRecordingResult(null);
    setAnalyser(null);
    setStage('LISTEN');
  };

  // Submit performance to server
  const handleSubmit = () => {
    playClick();
    setStage('EVALUATING');
    onSubmitPerformance(recordingResult?.audioBase64, recordingResult?.duration);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center z-10 animate-fadeIn text-center">
      {/* Round & Category Header */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono font-bold text-gray-400">ROUND</span>
          <span className="font-mono font-black text-sm text-purple-300">
            0{roundNumber} / 0{totalRounds}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-900/50 border border-purple-500/30 text-purple-300">
            CATEGORY: {challenge.category}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
            challenge.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            challenge.difficulty === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
            'bg-red-950 text-red-300 border border-red-800'
          }`}>
            {challenge.difficulty}
          </span>
        </div>
      </div>

      {/* Chaos Modifier Alert if Active */}
      {chaosModifier && (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-pink-950/80 to-purple-950/80 border border-amber-500/50 shadow-lg shadow-amber-950/30 flex items-center gap-3 text-left animate-bounce-subtle">
          <div className="p-2 rounded-xl bg-amber-900/50 text-xl shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                CHAOS MODIFIER ACTIVE
              </span>
            </div>
            <p className="text-xs text-white font-bold">
              Imitate with the special modifier: {chaosModifier.toUpperCase()}!
            </p>
          </div>
        </div>
      )}

      {/* Target Phrase Box */}
      <div className="w-full bg-gray-950/90 border border-purple-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 mb-6 backdrop-blur-md">
        <span className="inline-block text-[11px] uppercase font-bold text-pink-400 tracking-widest mb-2">
          TARGET PHRASE
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
          "{challenge.targetPhrase}"
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto italic mb-6">
          {challenge.description}
        </p>

        {/* Play Sample Button & Waveform */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handlePlaySample}
            disabled={stage === 'RECORDING' || stage === 'COUNTDOWN'}
            className={`py-3 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isPlayingSample
                ? 'bg-cyan-500 text-gray-950 shadow-cyan-500/40 scale-105'
                : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 hover:border-pink-400'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlayingSample ? 'animate-pulse' : ''}`} />
            <span>{isPlayingSample ? 'LISTENING TO SAMPLE...' : '🔊 PLAY SAMPLE AUDIO'}</span>
          </button>

          {/* Sample / Live Waveform */}
          <div className="w-full max-w-md">
            <WaveformCanvas 
              analyser={analyser}
              isActive={isPlayingSample || stage === 'RECORDING'} 
              colorTheme={stage === 'RECORDING' ? 'recording' : isPlayingSample ? 'sample' : 'idle'} 
              height={70} 
            />
          </div>
        </div>
      </div>

      {/* Dynamic Interaction Stage */}
      <div className="w-full max-w-md">
        {/* STAGE 1: LISTEN */}
        {stage === 'LISTEN' && (
          <button
            onClick={startPerformance}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-lg tracking-wider uppercase shadow-xl shadow-pink-950/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Mic className="w-6 h-6 animate-pulse" />
            I'M READY TO MIMIC!
          </button>
        )}

        {/* STAGE 2: COUNTDOWN */}
        {stage === 'COUNTDOWN' && (
          <div className="py-8 flex flex-col items-center justify-center animate-scaleUp">
            <span className="text-xs uppercase font-bold text-pink-400 tracking-widest mb-2">
              GET READY TO SPEAK IN...
            </span>
            <span className="font-mono text-8xl font-black text-pink-400 drop-shadow-[0_0_35px_rgba(236,72,153,0.8)]">
              {countdown}
            </span>
          </div>
        )}

        {/* STAGE 3: RECORDING */}
        {stage === 'RECORDING' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/50 flex items-center justify-between animate-pulse-glow">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-black text-sm text-red-300 uppercase tracking-wider">
                  🎙️ RECORDING YOUR MIMIC...
                </span>
              </div>
              <span className="font-mono font-black text-xl text-red-400">
                {recordingTimeLeft}s
              </span>
            </div>

            <button
              onClick={stopAndFinishRecording}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base tracking-wider uppercase shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="w-5 h-5 fill-current" />
              DONE RECORDING
            </button>
          </div>
        )}

        {/* STAGE 4: PREVIEW / SUBMIT */}
        {stage === 'PREVIEW' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              ✅ Recording captured! ({recordingResult?.duration.toFixed(1)} seconds)
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold text-sm tracking-wider uppercase border border-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                RETRY
              </button>

              <button
                onClick={handleSubmit}
                className="flex-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-base tracking-wider uppercase shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                SUBMIT TO AI JUDGE
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: EVALUATING */}
        {stage === 'EVALUATING' && (
          <div className="p-8 rounded-3xl bg-gray-950/90 border border-purple-600/40 flex flex-col items-center justify-center space-y-4 shadow-2xl shadow-purple-950/50">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-base font-black text-white tracking-wide">
                AI AUDIO ANALYSIS IN PROGRESS
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Extracting pitch autocorrelation ($F_0$), timing envelope, vocal timbre & expression dynamic range...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
