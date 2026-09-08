import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  analyser?: AnalyserNode | null;
  isActive?: boolean;
  colorTheme?: 'recording' | 'sample' | 'idle';
  height?: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  analyser,
  isActive = false,
  colorTheme = 'idle',
  height = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const h = canvas.height;
      const barCount = 48;
      const barWidth = Math.max(3, (width / barCount) - 3);

      if (analyser && isActive) {
        // Read live microphone frequencies
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step] || 0;
          const barHeight = Math.max(6, (val / 255) * (h - 10));
          const x = i * (barWidth + 3);
          const y = (h - barHeight) / 2;

          // Gradient
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (colorTheme === 'recording') {
            grad.addColorStop(0, '#f87171');
            grad.addColorStop(1, '#ef4444');
          } else {
            grad.addColorStop(0, '#c084fc');
            grad.addColorStop(1, '#a855f7');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else if (isActive && colorTheme === 'sample') {
        // Animated simulated sound wave
        phase += 0.08;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(phase + i * 0.25) * Math.cos(phase * 0.7 + i * 0.15);
          const barHeight = Math.max(6, Math.abs(wave) * (h - 12) + 10);
          const x = i * (barWidth + 3);
          const y = (h - barHeight) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#06b6d4');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        // Idle gentle breathing line
        phase += 0.03;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(phase + i * 0.15) * 4;
          const barHeight = Math.max(4, 8 + wave);
          const x = i * (barWidth + 3);
          const y = (h - barHeight) / 2;

          ctx.fillStyle = 'rgba(107, 114, 128, 0.35)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [analyser, isActive, colorTheme]);

  return (
    <div className="w-full flex justify-center items-center py-2">
      <canvas
        ref={canvasRef}
        width={480}
        height={height}
        className="w-full max-w-lg h-auto rounded-xl bg-gray-950/40 border border-purple-900/30 shadow-inner"
      />
    </div>
  );
};
