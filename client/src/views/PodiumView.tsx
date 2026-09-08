import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Sparkles, Flame } from 'lucide-react';
import { RoomState } from '../types.js';
import { playFanfare, playClick } from '../utils/soundEffects.js';

interface PodiumViewProps {
  room: RoomState;
  currentSocketId: string;
  onRestart: () => void;
  onNewParty: () => void;
  onHome: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  room,
  currentSocketId,
  onRestart,
  onNewParty,
  onHome
}) => {
  const isHost = room.hostId === currentSocketId;
  const sortedPlayers = [...room.players].sort((a, b) => b.totalScore - a.totalScore);

  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  useEffect(() => {
    playFanfare();

    // Trigger celebratory confetti burst
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center z-10 animate-fadeIn text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-widest mb-3 shadow-lg">
        <Sparkles className="w-4 h-4" />
        <span>CHAMPIONSHIP FINALS</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-2">
        🏆 PARTY WINNER
      </h1>
      <p className="text-sm text-purple-300 font-bold mb-8">
        The AI Judge has counted every pitch, decibel, and pause!
      </p>

      {/* 3D-Style Podium Stand */}
      <div className="w-full flex items-end justify-center gap-3 sm:gap-6 mb-10 pt-8">
        {/* 2ND PLACE (SILVER) */}
        {second && (
          <div className="flex-1 max-w-[170px] flex flex-col items-center animate-slideUp">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center text-3xl mb-2 shadow-lg">
              {second.avatar}
            </div>
            <span className="font-bold text-gray-200 text-sm truncate max-w-full mb-1">
              {second.name}
            </span>
            <span className="font-mono font-black text-lg text-gray-300 mb-2">
              {second.totalScore} pts
            </span>
            <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-gray-900 via-gray-800 to-slate-700 border-t-2 border-x-2 border-slate-500/40 flex flex-col items-center justify-center shadow-xl">
              <span className="text-2xl mb-1">🥈</span>
              <span className="text-xs font-black font-mono text-slate-300 uppercase tracking-widest">2ND</span>
            </div>
          </div>
        )}

        {/* 1ST PLACE (GOLD WINNER) */}
        {winner && (
          <div className="flex-1 max-w-[200px] flex flex-col items-center -mt-6 animate-scaleUp z-10">
            <div className="relative mb-2">
              <Crown className="w-9 h-9 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce-subtle drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-pink-500 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/40">
                {winner.avatar}
              </div>
            </div>
            <span className="font-black text-white text-base truncate max-w-full mb-0.5">
              {winner.name}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-black uppercase text-amber-300 tracking-wider mb-2">
              ★ {room.winner?.title || "VOICE GOD"} ★
            </span>
            <span className="font-mono font-black text-2xl text-amber-400 mb-2">
              {winner.totalScore} pts
            </span>
            <div className="w-full h-44 rounded-t-3xl bg-gradient-to-t from-amber-950/90 via-amber-900/60 to-amber-600/50 border-t-2 border-x-2 border-amber-400 flex flex-col items-center justify-center shadow-2xl shadow-amber-950/60">
              <span className="text-3xl mb-1">🥇</span>
              <span className="text-sm font-black font-mono text-amber-200 uppercase tracking-widest">CHAMPION</span>
            </div>
          </div>
        )}

        {/* 3RD PLACE (BRONZE) */}
        {third && (
          <div className="flex-1 max-w-[170px] flex flex-col items-center animate-slideUp">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center text-3xl mb-2 shadow-lg">
              {third.avatar}
            </div>
            <span className="font-bold text-gray-200 text-sm truncate max-w-full mb-1">
              {third.name}
            </span>
            <span className="font-mono font-black text-lg text-amber-600 mb-2">
              {third.totalScore} pts
            </span>
            <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-gray-900 via-amber-950/40 to-amber-900/40 border-t-2 border-x-2 border-amber-700/40 flex flex-col items-center justify-center shadow-xl">
              <span className="text-2xl mb-1">🥉</span>
              <span className="text-xs font-black font-mono text-amber-500 uppercase tracking-widest">3RD</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Session Standings Table */}
      <div className="w-full max-w-lg bg-gray-950/80 border border-purple-900/40 rounded-2xl p-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 text-left">
          Final Party Scoreboard
        </h3>
        <div className="space-y-2">
          {sortedPlayers.map((p, idx) => (
            <div 
              key={p.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs text-gray-400">#{idx + 1}</span>
                <span className="text-lg">{p.avatar}</span>
                <span className="font-bold text-white">{p.name}</span>
                {p.id === currentSocketId && (
                  <span className="text-[9px] bg-purple-900 text-purple-200 px-1 py-0.5 rounded uppercase font-bold">
                    YOU
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-pink-400">
                {p.totalScore} PTS
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        {isHost && (
          <button
            onClick={() => {
              playClick();
              onRestart();
            }}
            className="w-full sm:w-auto flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>
        )}

        <button
          onClick={() => {
            playClick();
            onNewParty();
          }}
          className="w-full sm:w-auto flex-1 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-pink-400" />
          NEW PARTY
        </button>

        <button
          onClick={() => {
            playClick();
            onHome();
          }}
          className="p-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Back to Landing Page"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
