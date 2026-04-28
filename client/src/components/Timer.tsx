import { useState, useEffect, useRef } from "react";

interface TimerProps {
  startTime: Date;
  timerDurationMinutes?: number;
  onTimeout?: () => void;
}

export const Timer = ({ startTime, timerDurationMinutes, onTimeout }: TimerProps) => {
  const [minutes, setMinutes] = useState<number | undefined>(undefined);
  const [seconds, setSeconds] = useState<number | undefined>(undefined);
  const hasTimedOut = useRef(false);

  const isCountdown = !!timerDurationMinutes;

  useEffect(() => {
    hasTimedOut.current = false;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsedMs = now.getTime() - new Date(startTime).getTime();

      if (isCountdown) {
        const limitMs = timerDurationMinutes * 60 * 1000;
        const remainingMs = Math.max(limitMs - elapsedMs, 0);
        const totalSeconds = Math.floor(remainingMs / 1000);

        setMinutes(Math.floor(totalSeconds / 60));
        setSeconds(totalSeconds % 60);

        if (remainingMs <= 0 && !hasTimedOut.current) {
          hasTimedOut.current = true;
          clearInterval(interval);
          onTimeout?.();
        }
      } else {
        const totalSeconds = Math.floor(elapsedMs / 1000);
        setMinutes(Math.floor(totalSeconds / 60));
        setSeconds(totalSeconds % 60);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timerDurationMinutes]);

  const isLow = isCountdown && minutes === 0 && seconds <= 30;

  return (
    <div className="timer" role="timer" aria-live="polite">
      <span style={isLow ? { color: "var(--color-error, #ef4444)", fontWeight: "bold" } : undefined}>
        {isCountdown ? "⏳" : "⌛"} {minutes !== undefined ? minutes : "--"}:
        {seconds !== undefined ? seconds.toString().padStart(2, "0") : "--"}
      </span>
    </div>
  );
};
