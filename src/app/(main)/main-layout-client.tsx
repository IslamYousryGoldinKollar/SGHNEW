
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Game, GameTheme } from '@/lib/types';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [gameId, setGameId] = useState<string | null>(null);
  const [theme, setTheme] = useState<GameTheme>('default');

  useEffect(() => {
    const segments = pathname.split('/');
    if (segments[1] === 'game' && segments[2]) {
      setGameId(segments[2].toUpperCase());
    } else {
      setGameId(null);
      setTheme('default');
    }
  }, [pathname]);

  useEffect(() => {
    if (!gameId) {
       document.documentElement.removeAttribute('data-theme');
       return;
    }
    
    const gameRef = doc(db, 'games', gameId);
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
    <>
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </>
  );
}
