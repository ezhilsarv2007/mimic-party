import React from 'react';
import { Trophy, ArrowRight, Medal, Crown } from 'lucide-react';
import { RoomState } from '../types.js';
import { playClick } from '../utils/soundEffects.js';

interface LeaderboardViewProps {
  room: RoomState;
  currentSocketId: string;
  onNextRound: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  room,
  currentSocketId,
  onNextRound
}) => {
  const isHost = room.hostId === currentSocketId;

  // Sort players descending by total score
  const sortedPlayers = [...room.players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center z-10 animate-fadeIn text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
        <Trophy className="w-3.5 h-3.5" />
        <span>ROUND 0{room.currentRound} STANDINGS</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
        🏆 PARTY LEADERBOARD
      </h2>

      {/* Leaderboard Table / Cards */}
      <div className="w-full space-y-3 mb-8">
        {sortedPlayers.map((player, index) => {
          const isYou = player.id === currentSocketId;
          const rank = index + 1;

          return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-gray-950 border-amber-500/50 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/30'
                  : isYou
                  ? 'bg-purple-950/40 border-purple-500/50'
                  : 'bg-gray-950/80 border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm">
                  {rank === 1 ? (
                    <Crown className="w-6 h-6 text-amber-400 drop-shadow" />
                  ) : rank === 2 ? (
                    <span className="text-gray-300 text-base">🥈</span>
                  ) : rank === 3 ? (
                    <span className="text-amber-600 text-base">🥉</span>
                  ) : (
                    <span className="text-gray-500">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner">
                  {player.avatar}
                </div>

                {/* Name */}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {player.name}
                    </span>
                    {isYou && (
                      <span className="text-[10px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {player.isHost ? 'Party Host' : 'Player'}
                  </span>
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {player.totalScore}
                </span>
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                  TOTAL PTS
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance to next round */}
      <div className="w-full max-w-md">
        {isHost ? (
          <button
            onClick={() => {
              playClick();
              onNextRound();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black text-base tracking-wider uppercase shadow-xl shadow-purple-950/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>START ROUND 0{room.currentRound + 1}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 font-medium">
            Waiting for Host to start Round 0{room.currentRound + 1}...
          </div>
        )}
      </div>
    </div>
  );
};
