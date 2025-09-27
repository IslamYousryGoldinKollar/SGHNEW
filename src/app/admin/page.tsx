"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Game } from "@/lib/types";

// A simple random PIN generator
const generatePin = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function AdminDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [sessions, setSessions] = useState<Game[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = collection(db, "games");
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessionsData: Game[] = [];
        querySnapshot.forEach((doc) => {
          sessionsData.push({ id: doc.id, ...doc.data() } as Game);
        });
        setSessions(sessionsData);
        setIsLoadingSessions(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const createNewSession = async () => {
    const newPin = generatePin();
    const gameRef = doc(db, "games", newPin);
    
    const newGame: Game = {
        id: newPin,
        status: "lobby",
        teams: [
          { name: "Team Alpha", score: 0, players: [], capacity: 10 },
          { name: "Team Bravo", score: 0, players: [], capacity: 10 },
        ],
        questions: [],
        createdAt: serverTimestamp() as any,
        gameStartedAt: null,
        timer: 300, // 5 minutes default
        topic: "General Knowledge",
        difficulty: "medium",
    };

    await setDoc(gameRef, newGame);
    // For now, let's just log it. We'll build the session config page next.
    console.log("Created new session with PIN:", newPin);
    // router.push(`/admin/session/${newPin}`);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-display">Admin Dashboard</h1>
        <Button onClick={() => auth.signOut()}>Sign Out</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Session</CardTitle>
          <CardDescription>Start a new trivia game with a unique PIN.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={createNewSession}>
            <Plus className="mr-2"/>
            Create Session
          </Button>
        </CardContent>
      </Card>
      
      <div className="mt-12">
        <h2 className="text-3xl font-bold font-display mb-4">Current Sessions</h2>
        {isLoadingSessions ? (
            <Loader2 className="animate-spin"/>
        ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(session => (
                    <Card key={session.id} className="bg-card/50">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Session: {session.id}</span>
                                <span className="text-sm px-2 py-1 rounded-md bg-secondary text-secondary-foreground">{session.status}</span>
                            </CardTitle>
                            <CardDescription>
                                {session.teams.length} teams, {session.teams.reduce((acc, t) => acc + t.players.length, 0)} players
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" variant="outline" onClick={() => router.push(`/admin/display/${session.id}`)}>
                                <Eye className="mr-2"/>
                                Open Big Screen
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <p>No active sessions. Create one to get started!</p>
        )}
      </div>
    </div>
  );
}
