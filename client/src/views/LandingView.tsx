import React, { useState } from 'react';
import { Mic, Sparkles, Users, Trophy, Play, Volume2, Flame, ShieldAlert } from 'lucide-react';
import { WaveformCanvas } from '../components/WaveformCanvas.js';
import { playClick, playFanfare } from '../utils/soundEffects.js';

interface LandingViewProps {
  onCreateParty: () => void;
  onJoinParty: () => void;
  onHowToPlay: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateParty,
  onJoinParty,
  onHowToPlay
}) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handleTestSample = () => {
    playClick();
    setIsPlayingDemo(true);
    setTimeout(() => {
      setIsPlayingDemo(false);
      playFanfare();
    }, 2800);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto text-center z-10 animate-fadeIn">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-purple-950/40">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span>Multiplayer AI Voice Party Game</span>
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
      </div>

      {/* Hero Title */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none mb-4">
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
          MIMIC PARTY
        </span>
      </h1>

      {/* Tagline */}
      <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide mb-4">
        "Hear it. Mimic it. Beat your friends."
      </p>

      {/* Description */}
      <p className="max-w-2xl text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
        Challenge your friends to imitate hilarious meme voices, gaming lines, and sound effects. 
        Our measurable AI audio engine judges your pitch, timing, voice timbre, and expression to crown the ultimate champion!
      </p>

      {/* Main CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center mb-12">
        <button
          onClick={onCreateParty}
          className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black text-base tracking-wider uppercase shadow-2xl shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          CREATE PARTY
        </button>

        <button
          onClick={onJoinParty}
          className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-gray-900/90 hover:bg-gray-800 border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-black text-base tracking-wider uppercase shadow-xl shadow-cyan-950/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Users className="w-5 h-5 text-cyan-400" />
          JOIN PARTY
        </button>
      </div>

      {/* Interactive Visual Playground Card */}
      <div className="w-full max-w-2xl rounded-3xl bg-gray-950/80 border border-purple-800/40 p-6 shadow-2xl shadow-purple-950/50 mb-12 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎭</span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">SAMPLE CHALLENGE</span>
              <h4 className="text-base font-bold text-white leading-tight">"Bro thinks he's the main character... respectfully, sit down!"</h4>
            </div>
          </div>
          <button
            onClick={handleTestSample}
            className="p-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <Volume2 className="w-4 h-4 text-pink-400" />
            <span>{isPlayingDemo ? 'PLAYING...' : 'TEST'}</span>
          </button>
        </div>

        {/* Live animated waveform representation */}
        <WaveformCanvas 
          isActive={isPlayingDemo} 
          colorTheme={isPlayingDemo ? 'sample' : 'idle'} 
          height={70} 
        />

        {/* Mock AI Judge reaction preview */}
        <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-base shrink-0">
            🤖
          </div>
          <p className="text-xs text-purple-200/90 italic">
            <strong className="text-pink-400 font-bold not-italic">AI Judge:</strong> "Bro became the original. Did you steal their vocal cords? 🔥 (Score: 94/100)"
          </p>
        </div>
      </div>

      {/* Game Features Teaser */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
        <div className="p-5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-3">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">True Audio DSP Analysis</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Measures measurable physical audio features: pitch F0 autocorrelation, timing envelopes, voice timbre, and dynamic range.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
          <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-700/50 flex items-center justify-center text-pink-400 mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Hilarious AI Reactions</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Gemini AI Judge provides context-aware funny party roasts and praises calibrated to your vocal performance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">4 Game Modes & Chaos</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Play Classic Party, 1v1 Battles, Tournaments, or Chaos Mode with Chipmunk, Robot, and Dramatic modifiers!
          </p>
        </div>
      </div>

      {/* Footer / How to Play button */}
      <div className="mt-12">
        <button
          onClick={onHowToPlay}
          className="text-xs text-gray-400 hover:text-purple-300 font-bold tracking-wider uppercase underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors"
        >
          📖 Read Complete Rules & How To Play
        </button>
      </div>
    </div>
  );
};
