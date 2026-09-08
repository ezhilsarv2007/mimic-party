import React from 'react';
import { X, MicOff, Settings, RefreshCw } from 'lucide-react';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  onRetry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gray-950 border border-red-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl shadow-red-950/50 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-red-950/80 border border-red-500/50 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-red-900/30 mb-3">
            <MicOff className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Microphone Access Required</h2>
          <p className="text-xs text-red-300/80 font-medium mt-1">
            MIMIC PARTY needs your microphone so the AI judge can hear your vocal imitation!
          </p>
        </div>

        <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 space-y-3 text-left mb-6">
          <div className="flex items-start gap-3 text-xs text-gray-300">
            <Settings className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">On Desktop (Chrome/Edge):</span> Click the padlock or camera/mic icon in the browser address bar, then switch Microphone to <strong className="text-emerald-400">Allow</strong>.
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs text-gray-300">
            <Settings className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">On Mobile (iOS/Android):</span> Check your browser settings to permit microphone recording for this domain.
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold rounded-xl border border-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
