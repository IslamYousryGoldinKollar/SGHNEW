"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

type TimerProps = {
  duration: number;
  onTimeout: () => void;
};

export default function Timer({ duration, onTimeout }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="text-center bg-card/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Time Remaining
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-bold font-mono text-primary">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
      </CardContent>
    </Card>
  );
}
