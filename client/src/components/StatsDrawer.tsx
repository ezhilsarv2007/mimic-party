import React from 'react';
import { X, Trophy, Zap, Target, TrendingUp, Flame } from 'lucide-react';
import { SessionStats } from '../types.js';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-950 border border-purple-800/40 rounded-3xl max-w-md w-full p-6 relative shadow-2xl shadow-purple-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Session Performance</h3>
            <p className="text-xs text-gray-400">Temporary match analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Best Score */}
          <div className="bg-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              Best Score
            </div>
            <span className="text-4xl font-black font-mono text-emerald-300 mt-2">
              {stats.bestScore > 0 ? stats.bestScore : '--'}
            </span>
          </div>

          {/* Average Score */}
          <div className="bg-gray-900/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              Average
            </div>
            <span className="text-4xl font-black font-mono text-purple-300 mt-2">
              {stats.averageScore > 0 ? stats.averageScore : '--'}
            </span>
          </div>
        </div>

        <div className="space-y-3 bg-gray-900/50 rounded-2xl p-4 border border-gray-800/80">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Strongest Skill</span>
            </div>
            <span className="font-bold text-cyan-400 uppercase tracking-wide">
              {stats.strongestSkill}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Target className="w-4 h-4 text-pink-400" />
              <span>Area to Polish</span>
            </div>
            <span className="font-bold text-pink-400 uppercase tracking-wide">
              {stats.weakestSkill}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Best Category</span>
            </div>
            <span className="font-bold text-amber-400 uppercase tracking-wide">
              {stats.bestCategory}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm border-t border-gray-800/60 pt-2 text-gray-400">
            <span>Rounds Performed</span>
            <span className="font-mono font-bold text-white">{stats.roundsPlayed}</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
