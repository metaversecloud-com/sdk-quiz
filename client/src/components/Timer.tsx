import { useState, useEffect } from "react";

export const Timer = ({ startTime }: { startTime: Date }) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - new Date(startTime).getTime();

      if (difference <= 0) {
        clearInterval(interval);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const calculatedMinutes = Math.floor(totalSeconds / 60);
      const calculatedSeconds = totalSeconds % 60;

      setMinutes(calculatedMinutes);
      setSeconds(calculatedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="timer">
      ⌛ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};
