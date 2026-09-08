import React, { useState } from 'react';
import { X, Sparkles, User } from 'lucide-react';
import { playClick } from '../utils/soundEffects.js';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, avatar: string) => void;
  isLoading?: boolean;
}

const AVATARS = ['🎭', '👾', '🤖', '🦊', '🐱', '🐸', '🦁', '👻'];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playClick();
    onCreate(name.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-gray-950 border border-purple-600/40 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl shadow-purple-900/40 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-purple-600/30 mb-3">
            {selectedAvatar}
          </div>
          <h2 className="text-2xl font-black text-white">Create New Party</h2>
          <p className="text-xs text-purple-300/80 font-medium">
            You'll be the Party Host! Pick your avatar and invite friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="e.g. Ezhil"
                maxLength={18}
                autoFocus
                required
                className="w-full bg-gray-900/90 border border-purple-900/50 focus:border-pink-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-semibold"
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Choose Your Party Persona
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
                      ? 'bg-purple-600 border-2 border-pink-400 scale-105 shadow-lg shadow-purple-600/50'
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
            disabled={!name.trim() || isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black tracking-wider uppercase shadow-xl shadow-purple-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                CREATE PARTY ROOM
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
