import React from 'react';
import { X, Volume2, Mic, Brain, Trophy, Flame } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Volume2 className="w-6 h-6 text-cyan-400" />,
      title: '1. LISTEN TO THE TARGET',
      desc: 'The host triggers a meme voice, cartoon effect, or legendary sound bite. Listen closely to the pitch, pauses, and cadence!'
    },
    {
      icon: <Mic className="w-6 h-6 text-pink-400" />,
      title: '2. MIMIC INTO YOUR MIC',
      desc: 'A 3-2-1 countdown signals your turn! The microphone fires up—imitate the accent, inflection, and energy as convincingly as possible.'
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: '3. AI JUDGE EVALUATION',
      desc: 'Our real-time audio DSP engine breaks down your performance across Voice Timbre (30%), Pitch (20%), Timing (20%), Speech (15%), and Expression (15%).'
    },
    {
      icon: <Flame className="w-6 h-6 text-amber-400" />,
      title: '4. ROASTS & LAUGHS',
      desc: 'Get your official Mimic Score (0–100) and an unhinged comedic roast or compliment from the AI Judge!'
    },
    {
      icon: <Trophy className="w-6 h-6 text-emerald-400" />,
      title: '5. CLIMB THE LEADERBOARD',
      desc: 'Compete across 5 rounds. Highest total score takes the winner podium and receives the legendary "VOICE GOD" title!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gray-950 border border-purple-700/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl shadow-purple-950/70 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 font-bold text-xs uppercase tracking-widest mb-2">
            The Gameplay Loop
          </div>
          <h2 className="text-2xl font-black text-white">How To Play MIMIC PARTY</h2>
          <p className="text-xs text-gray-400 mt-1">
            Fast, social, voice-powered multiplayer chaos!
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 items-start">
              <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 shrink-0 mt-0.5">
                {s.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide">{s.title}</h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30"
          >
            LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};
