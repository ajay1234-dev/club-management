"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

type EventCountdownProps = {
  deadline: Date | string;
};

export function EventCountdown({ deadline }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const deadlineTime = new Date(deadline).getTime();

    function calculateTime() {
      const now = new Date().getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setTimeLeft("Registration Closed");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let text = "";
      if (days > 0) {
        text += `${days}d ${hours}h`;
      } else if (hours > 0) {
        text += `${hours}h ${minutes}m`;
      } else {
        text += `${minutes}m ${seconds}s`;
      }

      setTimeLeft(text);
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold select-none ${
        isExpired
          ? "bg-rose-50 border border-rose-200 text-rose-700"
          : "bg-amber-50 border border-amber-200 text-amber-700 animate-pulse"
      }`}
    >
      <Timer className="size-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
}
