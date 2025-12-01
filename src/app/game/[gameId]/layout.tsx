
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Game, GameTheme } from "@/lib/types";

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const gameId = params.gameId as string;
  const [theme, setTheme] = useState<GameTheme>('default');

  useEffect(() => {
    if (!gameId) return;
    const gameRef = doc(db, "games", gameId.toUpperCase());
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as Game;
        setTheme(gameData.theme || 'default');
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
