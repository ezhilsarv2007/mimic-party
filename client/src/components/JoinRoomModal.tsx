import React, { useState } from 'react';
import { X, LogIn, User, KeyRound } from 'lucide-react';
import { playClick } from '../utils/soundEffects.js';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string, name: string, avatar: string) => void;
  initialCode?: string;
  isLoading?: boolean;
}

const AVATARS = ['🎤', '🐱', '🤖', '🐸', '🦊', '🦁', '👻', '🎭'];

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialCode = '',
  isLoading = false
}) => {
  const [roomCode, setRoomCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !name.trim()) return;
    playClick();
    onJoin(roomCode.trim(), name.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-gray-950 border border-cyan-600/40 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl shadow-cyan-950/40 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30 mb-3">
            {selectedAvatar}
          </div>
          <h2 className="text-2xl font-black text-white">Join A Party</h2>
          <p className="text-xs text-cyan-300/80 font-medium">
            Enter the 6-digit room code shared by your friend!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              6-Digit Room Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\s+/g, ''))}
                placeholder="e.g. 482731"
                maxLength={8}
                autoFocus={!initialCode}
                required
                className="w-full bg-gray-900/90 border border-cyan-900/50 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono tracking-widest text-lg uppercase font-bold"
              />
            </div>
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Your Player Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arun"
                maxLength={18}
                required
                className="w-full bg-gray-900/90 border border-gray-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(av);
                    playClick();
                  }}
                  className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-cyan-600 border-2 border-cyan-300 scale-105 shadow-lg shadow-cyan-600/40'
                      : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!roomCode.trim() || !name.trim() || isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-black tracking-wider uppercase shadow-xl shadow-cyan-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                ENTER PARTY LOBBY
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
