'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GameService } from '@/lib/gameService';
import { Game, Player, Question } from '@/lib/types';
interface UseGameStateReturn {
  game: Game | null;
  loading: boolean;
  currentPlayer: Player | null;
  isAdmin: boolean;
  currentQuestion: Question | null;
  subscribeToGame: (gameId: string) => () => void;
}
export function useGameState(gameId: string): UseGameStateReturn {
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const isAdmin = !!(game && user && game.adminId === user.uid);
  
  const updatePlayerData = useCallback((updatedGame: Game) => {
    if (!user) return;
    const player = updatedGame.teams
      ?.flatMap((t) => t.players)
      .find((p) => p.id === user.uid) || null;
    setCurrentPlayer(player);
    if (player && updatedGame.status === 'playing') {
      const answeredCount = player.answeredQuestions?.length || 0;
      if (answeredCount < updatedGame.questions.length) {
        setCurrentQuestion(updatedGame.questions[answeredCount]);
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [user]);

  const subscribeToGame = useCallback((id: string) => {
    setLoading(true);
    const unsubscribe = GameService.subscribeToGame(id, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);
      
      if (updatedGame) {
        updatePlayerData(updatedGame);
      } else {
        setCurrentPlayer(null);
        setCurrentQuestion(null);
      }
    });
    return unsubscribe;
  }, [updatePlayerData]);

  return {
    game,
    loading,
    currentPlayer,
    isAdmin,
    currentQuestion,
    subscribeToGame,
  };
}
