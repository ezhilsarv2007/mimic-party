import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Mic, 
  Activity, 
  Clock, 
  Volume2, 
  MessageSquare,
  Crown 
} from 'lucide-react';
import { RoomState, PlayerRoundResult } from '../types.js';
import { ScoreCounter } from '../components/ScoreCounter.js';
import { playFanfare, playClick } from '../utils/soundEffects.js';

interface ResultViewProps {
  room: RoomState;
  currentSocketId: string;
  onAdvance: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  room,
  currentSocketId,
  onAdvance
}) => {
  const [revealed, setRevealed] = useState(false);

  const currentPlayerResult = room.roundResults?.find(r => r.playerId === currentSocketId) 
    || room.roundResults?.[0];

  const score = currentPlayerResult?.score;
  const isHost = room.hostId === currentSocketId;

  const handleScoreComplete = () => {
    setRevealed(true);
    if ((score?.totalScore || 0) >= 80) {
      playFanfare();
    }
  };

  if (!score) {
    return (
      <div className="p-8 text-center text-gray-400">
        Waiting for round evaluations...
      </div>
    );
  }

  const metrics = [
    {
      label: 'Voice Similarity',
      val: score.voiceSimilarity,
      weight: '30%',
      icon: <Volume2 className="w-3.5 h-3.5 text-purple-400" />,
      color: 'from-purple-600 to-indigo-500'
    },
    {
      label: 'Pitch Accuracy',
      val: score.pitch,
      weight: '20%',
      icon: <Activity className="w-3.5 h-3.5 text-pink-400" />,
      color: 'from-pink-600 to-rose-500'
    },
    {
      label: 'Timing & Cadence',
      val: score.timing,
      weight: '20%',
      icon: <Clock className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Speech Clarity',
      val: score.speech,
      weight: '15%',
      icon: <Mic className="w-3.5 h-3.5 text-amber-400" />,
      color: 'from-amber-500 to-yellow-400'
    },
    {
      label: 'Expression & Energy',
      val: score.expression,
      weight: '15%',
      icon: <Flame className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'from-emerald-500 to-teal-400'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center z-10 animate-fadeIn text-center">
      {/* Top Banner */}
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span>ROUND 0{room.currentRound} EVALUATION</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
        🎭 MIMIC RESULT
      </h2>

      {/* Main Dramatic Score Card */}
      <div className="w-full bg-gray-950/90 border border-purple-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 mb-8 backdrop-blur-md">
        {/* Badge Title */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900 to-pink-900 border border-pink-500/50 text-pink-200 text-xs font-black uppercase tracking-widest mb-4 shadow-lg">
          ★ {score.badge} ★
        </div>

        {/* Animated Score Counter */}
        <div className="my-2">
          <ScoreCounter 
            targetScore={score.totalScore} 
            durationMs={1600}
            onComplete={handleScoreComplete}
          />
        </div>

        {/* AI Judge Reaction Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-gray-950 border border-purple-500/30 text-left shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">🤖</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-pink-400">
              AI JUDGE VERDICT
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-purple-100 italic leading-snug">
            "{score.aiJudgeReaction}"
          </p>
        </div>

        {/* 5-Metric Breakdown */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 text-left space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400 tracking-wider">
            <span>Audio Feature Breakdown</span>
            <span>Measurable DSP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="bg-gray-900/70 border border-gray-800/80 rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    ({m.weight})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-950 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${m.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${m.val}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-black text-white w-9 text-right">
                    {m.val}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Other Players' Scores in this Round */}
      {room.roundResults && room.roundResults.length > 1 && (
        <div className="w-full mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 text-left mb-3">
            Party Standings (Round 0{room.currentRound})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {room.roundResults.map((r, idx) => (
              <div
                key={r.playerId}
                className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-400">#{idx + 1}</span>
                  <span className="text-lg">{r.avatar}</span>
                  <span className="text-xs font-bold text-white truncate max-w-[90px]">
                    {r.playerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-pink-400">
                    {r.score.totalScore}
                  </span>
                  <span className="text-[10px] text-gray-500 block">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advance Action Buttons */}
      <div className="w-full max-w-md">
        {isHost ? (
          <button
            onClick={() => {
              playClick();
              onAdvance();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black text-base tracking-wider uppercase shadow-xl shadow-purple-950/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {room.currentRound >= room.totalRounds ? 'VIEW FINAL PODIUM' : 'VIEW LEADERBOARD'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 font-medium">
            Waiting for the Party Host to continue...
          </div>
        )}
      </div>
    </div>
  );
};
