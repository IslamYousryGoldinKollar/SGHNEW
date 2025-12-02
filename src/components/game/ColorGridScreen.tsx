
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GridSquare, Team } from "@/lib/types";
import HexMap from "./HexMap";
import { Button } from "../ui/button";

interface TerritoryClaimScreenProps {
  grid: GridSquare[];
  teams: Team[];
  onClaim: (hexId: number) => void;
  onSkip: () => void;
}

export default function TerritoryClaimScreen({ grid, teams, onClaim, onSkip }: TerritoryClaimScreenProps) {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft === 0) {
      onSkip();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSkip]);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Claim Your Territory!</h1>
        <p className="text-white/80 mt-1">You answered correctly! Click an empty hex to claim it.</p>
      </div>

      <div className="text-center mb-4 text-white">
        Time left to choose: <span className={cn("font-bold", timeLeft <= 3 && "text-destructive")}>{timeLeft}</span>
      </div>

      <div className="w-full max-w-lg aspect-square">
        <HexMap grid={grid} teams={teams} onHexClick={(id) => onClaim(id)} />
      </div>
      
      <Button onClick={onSkip} variant="link" className="mt-4 text-white/70">
        Skip for now
      </Button>
    </div>
  );
}
