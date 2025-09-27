"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import type { Player, Question, Game } from "@/lib/types";
import { generateQuestionsAction }from "@/lib/actions";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, getDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";

import Lobby from "@/components/game/Lobby";
import GameScreen from "@/components/game/GameScreen";
import ResultsScreen from "@/components/game/ResultsScreen";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


export default function GamePage() {
  const params = useParams();
  const GAME_ID = (params.gameId as string).toUpperCase();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const adminSettingsDoc = await getDoc(doc(db, "settings", "admin"));
        if (adminSettingsDoc.exists() && adminSettingsDoc.data().uid === user.uid) {
            setIsAdmin(true);
        }
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in error", error);
          toast({ title: "Authentication Error", description: "Could not sign in.", variant: "destructive" });
        });
      }
    });

    const gameRef = doc(db, "games", GAME_ID);
    const unsubGame = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
        setGame(gameData);
        
        if (authUser) {
          const player = gameData.teams?.flatMap(t => t.players).find(p => p.id === authUser.uid);
          setCurrentPlayer(player || null);
        }
      } else {
        toast({ title: "Game not found", description: "This game session does not exist.", variant: "destructive" });
        setGame(null);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubGame();
    };
  }, [GAME_ID, authUser?.uid, toast]);

 const handleJoinTeam = async (playerName: string, teamName: string) => {
    if (!playerName.trim()) {
      toast({ title: "Invalid Name", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    
    if (!game || !authUser) return;

    const gameRef = doc(db, "games", GAME_ID);
    const currentGame = (await getDoc(gameRef)).data() as Game;

    const isAlreadyInTeam = currentGame.teams.some(t => t.players.some(p => p.id === authUser.uid));
    if(isAlreadyInTeam) {
        toast({ title: "Already in a team", description: "You have already joined a team.", variant: "destructive" });
        return;
    }
    
    const teamIndex = currentGame.teams.findIndex((t) => t.name === teamName);
    if(teamIndex === -1) return;

    const team = currentGame.teams[teamIndex];

    if (team.players.length >= team.capacity) {
      toast({ title: "Team Full", description: `Sorry, ${teamName} is full.`, variant: "destructive" });
      return;
    }

    const newPlayer: Player = {
      id: authUser.uid,
      name: playerName,
      teamName: teamName,
      answeredQuestions: [],
    };
    
    const updatedTeams = [...currentGame.teams];
    updatedTeams[teamIndex].players.push(newPlayer);

    await updateDoc(gameRef, { teams: updatedTeams });
  };

  const handleStartGame = async () => {
    if (!game) return;
    const totalPlayers = game.teams.reduce((sum, t) => sum + t.players.length, 0);
    if (totalPlayers === 0) {
        toast({ title: "No players!", description: "At least one player must join to start.", variant: "destructive" });
        return;
    }
    
    const gameRef = doc(db, "games", GAME_ID);
    await updateDoc(gameRef, { status: "starting" });

    try {
      let questionsToUse: Question[] = game.questions || [];

      if (questionsToUse.length === 0) {
        const result = await generateQuestionsAction({
            topic: game.topic || "General Knowledge",
            difficulty: game.difficulty || "medium",
            numberOfQuestions: 20, // Generate a pool of 20 questions
        });
        if (result.questions) {
            questionsToUse = result.questions;
        } else {
            throw new Error("AI failed to generate questions.");
        }
      }

       await updateDoc(gameRef, {
          questions: questionsToUse,
          status: 'playing',
          gameStartedAt: serverTimestamp(),
          teams: game.teams.map(team => ({
            ...team,
            players: team.players.map(p => ({ ...p, answeredQuestions: [] }))
          }))
       });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Starting Game",
        description: "Could not prepare trivia questions. Please check session settings and try again.",
        variant: "destructive",
      });
      await updateDoc(gameRef, { status: "lobby" });
    }
  };

  const getNextQuestion = useCallback(() => {
    if (!game || !currentPlayer) return null;
    
    const answered = currentPlayer.answeredQuestions || [];
    const availableQuestions = game.questions.filter(
        q => !answered.includes(q.question)
    );

    if (availableQuestions.length === 0) {
      return null; // No more questions available
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }, [game, currentPlayer]);

  // Set initial question when game starts
  useEffect(() => {
    if (game?.status === 'playing' && !currentQuestion) {
      setCurrentQuestion(getNextQuestion());
    }
  }, [game?.status, currentQuestion, getNextQuestion]);


  const handleAnswer = async (question: Question, answer: string) => {
    if (!game || !currentPlayer) return;

    const isCorrect = question.answer.trim().toLowerCase() === answer.trim().toLowerCase();
    
    const gameRef = doc(db, "games", GAME_ID);
    const currentGame = (await getDoc(gameRef)).data() as Game;

    const teamIndex = currentGame.teams.findIndex(t => t.name === currentPlayer.teamName);
    if (teamIndex === -1) return;

    const playerIndex = currentGame.teams[teamIndex].players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex === -1) return;
    
    const updatedTeams = [...currentGame.teams];
    const teamToUpdate = updatedTeams[teamIndex];
    const playerToUpdate = teamToUpdate.players[playerIndex];

    const updatedScore = isCorrect ? teamToUpdate.score + 10 : teamToUpdate.score;
    teamToUpdate.score = updatedScore;

    playerToUpdate.answeredQuestions = [...(playerToUpdate.answeredQuestions || []), question.question];
    
    await updateDoc(gameRef, { teams: updatedTeams });

    // After submitting, immediately get the next question
    const nextQ = getNextQuestion();
    setCurrentQuestion(nextQ);
  };
  
  const handleTimeout = async () => {
    if(game?.status === 'playing') {
      await updateDoc(doc(db, "games", GAME_ID), { status: "finished" });
      toast({
        title: "Time's Up!",
        description: `The game timer has expired.`,
      });
    }
  };

  const handlePlayAgain = async () => {
    if (!game) return;
    await updateDoc(doc(db, "games", GAME_ID), {
      status: "lobby",
      teams: game.teams.map(t => ({
          name: t.name,
          capacity: t.capacity,
          score: 0, 
          players: [] 
      })),
      questions: [],
      gameStartedAt: null,
    });
  };

  const renderContent = () => {
    if (loading || !game) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-4xl font-bold mt-4 font-display">
                {loading ? 'Finding Session...' : 'Session Not Found'}
            </h1>
            <p className="text-muted-foreground mt-2">
                {loading ? 'Verifying your session PIN...' : 'The session PIN you entered is invalid. Please check the PIN and try again.'}
            </p>
        </div>
      )
    }

    switch (game.status) {
      case "lobby":
        return (
          <Lobby
            teams={game.teams}
            onJoinTeam={handleJoinTeam}
            onStartGame={handleStartGame}
            currentPlayer={currentPlayer}
            isAdmin={isAdmin}
          />
        );
      case "starting":
        return (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-4xl font-bold mt-4 font-display">Generating Questions...</h1>
            <p className="text-muted-foreground mt-2">Get ready for battle!</p>
          </div>
        );
      case "playing":
        if (!currentPlayer) {
            return (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <h1 className="text-4xl font-bold font-display">Game in Progress</h1>
                    <p className="text-muted-foreground mt-2">A game is currently being played. You can join the next round once this one is finished.</p>
                </div>
            );
        }
        
        const playerTeam = game.teams.find((t) => t.name === currentPlayer.teamName);
        if (!playerTeam) return <p>Error: Your team could not be found.</p>;
        
        if (!currentQuestion) {
             return (
             <div className="flex flex-col items-center justify-center flex-1 text-center">
               <h1 className="text-4xl font-bold font-display">You've answered all the questions!</h1>
               <p className="text-muted-foreground mt-2">Waiting for the game to end...</p>
             </div>
           );
        }

        return (
          <GameScreen
            teams={game.teams}
            currentPlayer={currentPlayer}
            question={currentQuestion}
            onAnswer={handleAnswer}
            duration={game.timer || 300}
            onTimeout={handleTimeout}
            gameStartedAt={game.gameStartedAt}
          />
        );
      case "finished":
        return <ResultsScreen teams={game.teams} onPlayAgain={handlePlayAgain} isAdmin={isAdmin} />;
      default:
        return <div className="text-center">Unknown game state.</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
      {renderContent()}
    </div>
  );
}
