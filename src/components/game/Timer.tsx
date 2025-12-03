
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

interface TimerProps {
  initialTime?: number;
  gameStartedAt?: Timestamp | null | undefined;
  onTimeUp?: () => void;
  isRunning?: boolean;
  className?: string;
  duration?: number;
  onTimeout?: () => void;
}

export function Timer({ 
  initialTime, 
  gameStartedAt,
  onTimeUp, 
  isRunning = true,
  className,
  duration,
  onTimeout
}: TimerProps) {
  const effectiveInitialTime = initialTime ?? duration ?? 0;
  const effectiveOnTimeUp = onTimeUp ?? onTimeout;
  const [timeLeft, setTimeLeft] = useState(effectiveInitialTime);

  useEffect(() => {
    setTimeLeft(effectiveInitialTime);
  }, [effectiveInitialTime]);

  useEffect(() => {
    if (!isRunning || !gameStartedAt) {
      return;
    }

    const startTime = gameStartedAt.toMillis();
    const endTime = startTime + effectiveInitialTime * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const remainingSeconds = Math.ceil(remaining / 1000);
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0 && effectiveOnTimeUp) {
        effectiveOnTimeUp();
      }
    };
    
    updateTimer(); 

    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [isRunning, gameStartedAt, effectiveInitialTime, effectiveOnTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft <= 60;
  const isCriticalTime = timeLeft <= 30;

  return (
    <div className={cn("text-center", className)}>
      <span className={cn(
        "text-5xl md:text-6xl font-bold tracking-tight drop-shadow-lg transition-colors duration-300",
        isCriticalTime ? "text-red-500 animate-pulse" : 
        isLowTime ? "text-orange-400" : 
        "text-white"
      )}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

export default Timer;
