import React, { useState } from 'react';
import { Volume2, VolumeX, BarChart3, HelpCircle, Copy, Check } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playClick } from '../utils/soundEffects.js';

interface NavbarProps {
  roomCode?: string;
  onOpenStats?: () => void;
  onOpenHelp?: () => void;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  onOpenStats,
  onOpenHelp,
  onLeaveRoom
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [copied, setCopied] = useState(false);

  const toggleAudio = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClick();
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between z-30">
      {/* Brand Logo */}
      <div 
        onClick={onLeaveRoom}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
          🎭
        </div>
        <div className="text-left">
          <h1 className="text-xl md:text-2xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent leading-none">
            MIMIC PARTY
          </h1>
          <p className="text-[10px] text-purple-300/70 font-semibold tracking-widest uppercase">
            AI Voice Battles
          </p>
        </div>
      </div>

      {/* Center Room Code Pill if inside room */}
      {roomCode && (
        <div 
          onClick={copyRoomCode}
          className="cursor-pointer bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 rounded-full px-3.5 py-1.5 flex items-center gap-2 transition-all shadow-md group"
          title="Click to copy Room Code"
        >
          <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">ROOM:</span>
          <span className="font-mono font-black text-sm text-pink-300 tracking-widest">{roomCode}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-200 transition-colors" />
          )}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleAudio}
          className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
          title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>

        <button
          onClick={onOpenStats}
          className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
          title="Session Stats"
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
          title="How to Play"
        >
          <HelpCircle className="w-4 h-4 text-pink-400" />
        </button>
      </div>
    </header>
  );
};
