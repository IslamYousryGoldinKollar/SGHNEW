
"use client";

import type { Team, Player, Game, GridSquare } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Sparkles, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";


type ResultsScreenProps = {
  game: Game;
  onPlayAgain: () => void;
  isAdmin: boolean;
  individualPlayerId?: string;
};

export default function ResultsScreen({ game, onPlayAgain, isAdmin, individualPlayerId }: ResultsScreenProps) {
  const [user] = useAuthState(auth);
  const isArabicUser = user?.email === 'iyossry@gmail.com';
  const { teams, sessionType, parentSessionId, id: gameId } = game;
  const router = useRouter();
  
  useEffect(() => {
    // If it's a finished individual game, redirect to the parent leaderboard
    if (individualPlayerId && parentSessionId) {
        const timer = setTimeout(() => {
           router.push(`/leaderboard/${parentSessionId}?player_id=${individualPlayerId}`);
        }, 5000); // 5-second delay before redirecting

        return () => clearTimeout(timer);
    }
  }, [individualPlayerId, parentSessionId, router]);


  const { winningTeams, isTie, winReason } = useMemo(() => {
    if (!teams || teams.length === 0) {
      return { winningTeams: [], isTie: false, winReason: "" };
    }
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const topScore = sortedTeams[0].score;

    const winners = sortedTeams.filter(t => t.score === topScore && topScore > 0);
    return { winningTeams: winners, isTie: winners.length > 1, winReason: isArabicUser ? "حسب النتيجة" : "by score" };

  }, [teams, sessionType, isArabicUser]);


  if (individualPlayerId) {
    const player = teams.flatMap(t => t.players).find(p => p.id === individualPlayerId);
    if (!player) return <div className="text-center">{isArabicUser ? 'لا يمكن تحميل نتائجك.' : 'Could not load your results.'}</div>;
    
    // For individual mode, the player's score is what matters.
    const finalScore = player.score || 0;

    return (
       <div className={cn("flex flex-col items-center justify-center text-center flex-1 animate-in fade-in-50 duration-500", isArabicUser && "font-arabic")} dir={isArabicUser ? 'rtl' : 'ltr'}>
            <Trophy className="h-24 w-24 text-yellow-400 drop-shadow-lg" />
            <h1 className="text-5xl font-bold mt-4 font-display">{isArabicUser ? 'اكتمل التحدي!' : 'Challenge Complete!'}</h1>
            <CardDescription className="text-2xl pt-4">
                {isArabicUser ? `أحسنت يا ${player.name}! هذه هي نتيجتك.` : `Well done, ${player.name}! Here's your score.`}
            </CardDescription>
            <Card className="my-12 shadow-lg w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-display text-primary">{isArabicUser ? 'نتيجتك النهائية' : 'Your Final Score'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-6xl font-bold text-primary">{finalScore}</p>
                    <p className="text-muted-foreground">{isArabicUser ? 'نقاط' : 'points'}</p>
                </CardContent>
            </Card>
            <p className="text-muted-foreground animate-pulse">{isArabicUser ? 'جاري إعادة التوجيه إلى لوحة الصدارة...' : 'Redirecting to the leaderboard...'}</p>
       </div>
    )
  }

  const sortedTeamsByScore = [...teams].sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (winningTeams.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [winningTeams]);


  return (
    <div className={cn("flex flex-col items-center justify-center text-center flex-1 animate-in fade-in-50 duration-500", isArabicUser && "font-arabic")} dir={isArabicUser ? 'rtl' : 'ltr'}>
      <Trophy className="h-24 w-24 text-yellow-400 drop-shadow-lg" />
      
      {winningTeams.length > 0 ? (
        <>
          <h1 className="text-5xl font-bold mt-4 font-display">
            {isTie ? (isArabicUser ? "إنه تعادل!" : "It's a Tie!") : `${winningTeams.length > 1 ? (isArabicUser ? 'الفائزون!' : 'Winners!') : (isArabicUser ? `فريق ${winningTeams[0].name} يفوز!` : `${winningTeams[0].name} Wins!`)}`}
          </h1>
          <CardDescription className="text-2xl pt-4">
            {isArabicUser ? 'تهانينا للفائزين!' : 'Congratulations to the winners!'}
             {winReason && <span className="text-sm block">({winReason})</span>}
          </CardDescription>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {winningTeams.flatMap(team => team.players).map(player => (
              <div key={player.id} className="p-4 bg-card rounded-lg shadow-lg border border-primary">
                <p className="text-2xl font-bold text-primary">{player.name}</p>
                <p className="text-sm text-muted-foreground">{isArabicUser ? 'معرف' : 'ID'}: {player.playerId}</p>
              </div>
            ))}
          </div>

        </>
      ) : (
         <h1 className="text-5xl font-bold mt-4 font-display">{isArabicUser ? 'انتهت اللعبة!' : 'Game Over!'}</h1>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl my-12">
        {sortedTeamsByScore.map((team) => (
          <Card key={team.name} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display" style={{color: team.color}}>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold" style={{color: team.color}}>{team.score}</p>
              <p className="text-muted-foreground">{isArabicUser ? 'مجموع النقاط' : 'total points'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {isAdmin && !parentSessionId && (
        <Button onClick={onPlayAgain} size="lg" className="mt-12">
          {isArabicUser ? 'العب مرة أخرى' : 'Play Again'}
        </Button>
      )}

      {parentSessionId && (
         <p className="text-muted-foreground mt-8 animate-pulse">{isArabicUser ? 'العودة إلى الردهة...' : 'Returning to lobby...'}</p>
      )}
    </div>
  );
}
