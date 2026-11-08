import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Bell, X, Sparkles } from 'lucide-react';

interface ClassTimerProps {
  onClose: () => void;
}

export const ClassTimer: React.FC<ClassTimerProps> = ({ onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(5 * 60); // Default 5 minutes
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const setPresetMinutes = (mins: number) => {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsRunning(false);
    setIsFinished(false);
  };

  const handleReset = () => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white px-4 py-2.5 border-b border-amber-700/50 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Bell className={`w-4 h-4 ${isRunning ? 'animate-bounce text-amber-400' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">집중 글쓰기 타이머</span>
              {isFinished && (
                <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                  작성 시간 종료!
                </span>
              )}
            </div>
            <p className="text-xs text-stone-300 hidden sm:block">
              목표한 시간에 맞춰 몰입해서 작성해보세요
            </p>
          </div>
        </div>

        {/* Center: Presets & Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-stone-700/60">
            {[3, 5, 7].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setPresetMinutes(mins)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  totalSeconds === mins * 60
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {mins}분
              </button>
            ))}
          </div>

          {/* Time digits */}
          <div className="font-mono text-2xl font-black text-amber-300 bg-black/60 px-3.5 py-1 rounded-xl border border-amber-500/30 tracking-wider">
            {formatTime(remainingSeconds)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>일시정지</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>시작</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-all border border-stone-700"
              title="타이머 리셋"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Close button */}
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-all self-end md:self-center"
          title="타이머 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Thin progress bar */}
      <div className="w-full bg-stone-800/80 h-1 mt-2 rounded-full overflow-hidden">
        <div
          className="bg-amber-400 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
