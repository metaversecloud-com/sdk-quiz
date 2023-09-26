import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

function Timer() {
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);

  useEffect(() => {
    if (startTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - startTimestamp);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTimestamp]);

  if (endTimestamp) {
    return null;
  }

  return (
    <div className="timer" style={{ textAlign: "center" }}>
      ⌛ {moment.utc(elapsedTime).format("HH:mm:ss")}
    </div>
  );
}

export default Timer;
