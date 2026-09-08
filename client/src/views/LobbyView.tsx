import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  CheckCircle2, 
  Clock, 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  Swords, 
  Trophy, 
  Zap,
  ArrowLeft 
} from 'lucide-react';
import { RoomState, GameMode } from '../types.js';
import { playClick } from '../utils/soundEffects.js';

interface LobbyViewProps {
  room: RoomState;
  currentSocketId: string;
  onReady: () => void;
  onSetMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const MODES: Array<{ id: GameMode; name: string; icon: React.ReactNode; desc: string; rounds: number }> = [
  {
    id: 'classic',
    name: 'Classic Party',
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    desc: 'Everyone performs the same voice challenge. Standard fun!',
    rounds: 5
  },
  {
    id: 'battle',
    name: 'Battle Mode',
    icon: <Swords className="w-4 h-4 text-pink-400" />,
    desc: 'Fast-paced intense head-to-head duel.',
    rounds: 3
  },
  {
    id: 'tournament',
    name: 'Tournament',
    icon: <Trophy className="w-4 h-4 text-amber-400" />,
    desc: 'Multi-round marathon to crown the supreme voice king.',
    rounds: 6
  },
  {
    id: 'chaos',
    name: 'Chaos Mode',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    desc: 'Random modifiers (Chipmunk, Robot, Furious, Slow Motion)!',
    rounds: 5
  }
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentSocketId,
  onReady,
  onSetMode,
  onStartGame,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);

  const currentPlayer = room.players.find(p => p.id === currentSocketId);
  const isHost = currentPlayer?.isHost || false;

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeSelect = (mode: GameMode) => {
    if (!isHost) return;
    playClick();
    onSetMode(mode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center z-10 animate-fadeIn">
      {/* Top Navigation & Room Code Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Leave Party
        </button>

        {/* Big Room Code Box */}
        <div 
          onClick={copyCode}
          className="cursor-pointer bg-gradient-to-r from-purple-950/80 to-pink-950/80 border-2 border-purple-500/50 hover:border-pink-400 rounded-2xl px-6 py-3 shadow-xl shadow-purple-950/50 flex items-center gap-3 transition-all group"
        >
          <div>
            <span className="block text-[10px] uppercase font-bold text-purple-300 tracking-widest">
              ROOM CODE (CLICK TO COPY)
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest">
              {room.roomCode}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-purple-900/60 group-hover:bg-purple-800/80 transition-colors">
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5 text-purple-300 group-hover:text-white" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>{room.players.length}/{room.maxPlayers}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* Left Column: Player Cards Grid (2 cols wide on desktop) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Party Members ({room.players.length})
            </h3>
            <span className="text-xs text-purple-400/80 italic">
              Share code with friends to join!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.players.map((p) => {
              const isYou = p.id === currentSocketId;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isYou
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/40'
                      : 'bg-gray-950/60 border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner">
                      {p.avatar}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base leading-tight">
                          {p.name}
                        </span>
                        {isYou && (
                          <span className="text-[10px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {p.isHost ? 'Party Host' : p.isReady ? 'Ready' : 'Waiting...'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {p.isHost ? (
                      <div className="flex items-center gap-1 text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Crown className="w-3.5 h-3.5" />
                        <span>HOST</span>
                      </div>
                    ) : p.isReady ? (
                      <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>READY</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>WAITING</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Game Mode Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Game Mode
          </h3>

          <div className="space-y-2.5">
            {MODES.map((m) => {
              const selected = room.mode === m.id;
              return (
                <button
                  key={m.id}
                  disabled={!isHost}
                  onClick={() => handleModeSelect(m.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selected
                      ? 'bg-gradient-to-r from-purple-950/80 to-pink-950/80 border-pink-500/60 shadow-lg shadow-pink-950/30 ring-1 ring-pink-500/30'
                      : 'bg-gray-950/40 border-gray-800 hover:border-gray-700'
                  } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      {m.icon}
                      <span>{m.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400 font-bold">
                      {m.rounds} Rounds
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-snug">{m.desc}</p>
                </button>
              );
            })}
          </div>

          {!isHost && (
            <p className="text-[11px] text-gray-500 text-center italic">
              Only the Party Host can change the game mode.
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full max-w-md pt-4">
        {isHost ? (
          <button
            onClick={() => {
              playClick();
              onStartGame();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-gray-950 font-black text-lg tracking-wider uppercase shadow-xl shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            START PARTY GAME
          </button>
        ) : (
          <button
            onClick={() => {
              playClick();
              onReady();
            }}
            className={`w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              currentPlayer?.isReady
                ? 'bg-gray-800 border-2 border-emerald-500 text-emerald-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-950/50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {currentPlayer?.isReady ? 'READY! (CLICK TO UNREADY)' : "I'M READY TO PLAY"}
          </button>
        )}
      </div>
    </div>
  );
};
