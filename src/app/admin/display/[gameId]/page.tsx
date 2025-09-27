"use client";

// This is a placeholder for the "Big Screen" view.
// We will build this out in a future step.

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Game } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DisplayPage() {
    const params = useParams();
    const gameId = params.gameId as string;
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId) return;
        const gameRef = doc(db, "games", gameId);
        const unsubscribe = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                setGame({ id: doc.id, ...doc.data() } as Game);
            } else {
                setGame(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [gameId]);

    const handleStartGame = async () => {
        if (!gameId) return;
        const gameRef = doc(db, "games", gameId);
        // For now, just change the status. Full logic is in game page.
        // This is just a remote control.
        await updateDoc(gameRef, { status: "playing", gameStartedAt: new Date() });
    };

    const handleEndGame = async () => {
        if (!gameId) return;
        const gameRef = doc(db, "games", gameId);
        await updateDoc(gameRef, { status: "finished" });
    };
    
    const renderContent = () => {
        if (loading) {
            return <Loader2 className="h-16 w-16 animate-spin" />;
        }
        if (!game) {
            return <h1 className="text-4xl text-destructive">Session Not Found</h1>;
        }

        const sortedTeams = [...game.teams].sort((a, b) => b.score - a.score);

        return (
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold font-display uppercase tracking-widest text-primary">{game.id}</h1>
                    <h2 className="text-4xl text-muted-foreground">{game.status.toUpperCase()}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                    {sortedTeams.map(team => (
                        <div key={team.name} className="p-8 border-4 border-primary rounded-lg bg-card/50 text-center">
                            <h3 className="text-4xl font-display text-accent">{team.name}</h3>
                            <p className="text-8xl font-bold font-mono my-4">{team.score}</p>
                            <p className="text-muted-foreground">{team.players.length} players</p>
                        </div>
                    ))}
                </div>

                {game.status === 'lobby' && (
                    <Button size="lg" onClick={handleStartGame}>Start Game</Button>
                )}
                 {game.status === 'playing' && (
                    <Button size="lg" variant="destructive" onClick={handleEndGame}>End Game</Button>
                )}
            </div>
        )

    }

    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-8">
            {renderContent()}
        </div>
    );
}
