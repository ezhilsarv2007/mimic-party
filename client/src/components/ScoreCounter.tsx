import React, { useEffect, useState } from 'react';
import { playScoreCountTick } from '../utils/soundEffects.js';

interface ScoreCounterProps {
  targetScore: number;
  durationMs?: number;
  size?: 'normal' | 'large';
  onComplete?: () => void;
}

export const ScoreCounter: React.FC<ScoreCounterProps> = ({
  targetScore,
  durationMs = 1800,
  size = 'large',
  onComplete
}) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const scoreNow = Math.floor(ease * targetScore);

      if (scoreNow !== start) {
        start = scoreNow;
        setCurrentScore(scoreNow);
        if (scoreNow % 4 === 0) {
          playScoreCountTick();
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentScore(targetScore);
        onComplete?.();
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [targetScore, durationMs]);

  const getColor = () => {
    if (currentScore >= 90) return 'text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]';
    if (currentScore >= 80) return 'text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.6)]';
    if (currentScore >= 70) return 'text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]';
    return 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]';
  };

  return (
    <div className="flex flex-col items-center justify-center font-black select-none">
      <span className={`font-mono transition-colors duration-200 ${getColor()} ${
        size === 'large' ? 'text-7xl md:text-8xl tracking-tight' : 'text-4xl md:text-5xl'
      }`}>
        {currentScore}
      </span>
      <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">
        / 100 POINTS
      </span>
    </div>
  );
};
