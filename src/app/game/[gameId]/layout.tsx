
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const gameId = params.gameId as string;

  return (
    <div className={cn("flex flex-col min-h-screen text-foreground", "game-screen")}>
      {children}
    </div>
  );
}
