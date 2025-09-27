"use client";

import { useState, useEffect, useCallback } from "react";
import type { Team, Player, Question, GameStatus } from "@/lib/types";
import { generateQuestionsAction } from "@/lib/actions";

import Lobby from "@/components/game/Lobby";
import GameScreen from "@/components/game/GameScreen";
import ResultsScreen from "@/components/game/ResultsScreen";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const INITIAL_TEAMS: Team[] = [
  { name: "Team Alpha", score: 0, players: [] },
  { name: "Team Bravo", score: 0, players: [] },
];

const GAME_DURATION = 5 * 60; // 5 minutes
const QUESTIONS_PER_PLAYER = 5;

export default function Home() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("lobby");
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  const handleJoinTeam = (playerName: string, teamName: string) => {
    if (!playerName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const team = teams.find((t) => t.name === teamName);
    if (team && team.players.length >= 10) {
      toast({
        title: "Team Full",
        description: `Sorry, ${teamName} already has 10 players.`,
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: uuidv4(),
      name: playerName,
      teamName: teamName,
      currentQuestionIndex: 0,
    };

    setTeams((prevTeams) =>
      prevTeams.map((t) =>
        t.name === teamName ? { ...t, players: [...t.players, newPlayer] } : t
      )
    );
    setCurrentPlayer(newPlayer);
  };

  const handleStartGame = async () => {
    const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
    if (totalPlayers === 0) {
        toast({ title: "No players!", description: "At least one player must join to start.", variant: "destructive" });
        return;
    }

    setGameStatus("starting");
    try {
      const neededQuestions = totalPlayers * QUESTIONS_PER_PLAYER;
      const result = await generateQuestionsAction({
        topic: "General Knowledge",
        difficulty: "medium",
        numberOfQuestions: neededQuestions,
      });

      if (result.questions) {
        setQuestions(result.questions);
        setTeams(prevTeams => prevTeams.map(team => ({
          ...team,
          players: team.players.map(p => ({ ...p, currentQuestionIndex: 0 }))
        })));
        setGameStatus("playing");
      } else {
        throw new Error("Failed to generate questions.");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Starting Game",
        description: "Could not generate trivia questions. Please try again.",
        variant: "destructive",
      });
      setGameStatus("lobby");
    }
  };

  const handleAnswer = (question: Question, answer: string) => {
    const isCorrect = question.answer.trim().toLowerCase() === answer.trim().toLowerCase();
    
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.name !== currentPlayer?.teamName) return team;
        
        const updatedScore = isCorrect ? team.score + 10 : team.score;
        const updatedPlayers = team.players.map(p => 
          p.id === currentPlayer?.id 
            ? { ...p, currentQuestionIndex: p.currentQuestionIndex + 1 }
            : p
        );
        
        return { ...team, score: updatedScore, players: updatedPlayers };
      })
    );
  };

  const handleNextQuestion = useCallback(() => {
    // This function is now just for checking game end condition
    if (!currentPlayer) return;

    const playerInState = teams.flatMap(t => t.players).find(p => p.id === currentPlayer.id);
    
    if (playerInState && playerInState.currentQuestionIndex >= QUESTIONS_PER_PLAYER) {
      // Player has finished their questions
    }
    
    const allPlayersFinished = teams.flatMap(t => t.players).every(p => p.currentQuestionIndex >= QUESTIONS_PER_PLAYER);
    if (allPlayersFinished && teams.flatMap(t => t.players).length > 0) {
      setGameStatus("finished");
    }
  }, [currentPlayer, teams]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      handleNextQuestion();
    }
  }, [teams, gameStatus, handleNextQuestion]);

  const handleTimeout = () => {
    setGameStatus("finished");
    toast({
      title: "Time's Up!",
      description: "The 5-minute timer has expired.",
    });
  };

  const handlePlayAgain = () => {
    setTeams(INITIAL_TEAMS.map(t => ({ ...t, players: [], score: 0 })));
    setCurrentPlayer(null);
    setQuestions([]);
    setGameStatus("lobby");
  };

  const renderContent = () => {
    switch (gameStatus) {
      case "lobby":
        return (
          <Lobby
            teams={teams}
            onJoinTeam={handleJoinTeam}
            onStartGame={handleStartGame}
            currentPlayer={currentPlayer}
          />
        );
      case "starting":
        return (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-4xl font-bold mt-4">Generating Questions...</h1>
            <p className="text-muted-foreground mt-2">Get ready for battle!</p>
          </div>
        );
      case "playing":
        if (!currentPlayer) return <p>Error: Current player not found.</p>;
        const playerTeam = teams.find((t) => t.name === currentPlayer.teamName);
        if (!playerTeam) return <p>Error: Player's team not found.</p>;
        const playerState = playerTeam.players.find(p => p.id === currentPlayer.id);
        if (!playerState) return <p>Error: Player state not found.</p>;
        
        const currentQuestion = questions[playerState.currentQuestionIndex + teams.findIndex(t => t.name === playerTeam.name) * (questions.length / 2)];
        
        if (playerState.currentQuestionIndex >= QUESTIONS_PER_PLAYER) {
           return (
             <div className="flex flex-col items-center justify-center flex-1 text-center">
               <h1 className="text-4xl font-bold">You've finished your questions!</h1>
               <p className="text-muted-foreground mt-2">Waiting for other players to finish...</p>
             </div>
           );
        }

        return (
          <GameScreen
            teams={teams}
            currentPlayer={currentPlayer}
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNextQuestion={handleNextQuestion}
            duration={GAME_DURATION}
            onTimeout={handleTimeout}
          />
        );
      case "finished":
        return <ResultsScreen teams={teams} onPlayAgain={handlePlayAgain} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
      {renderContent()}
    </div>
  );
}
