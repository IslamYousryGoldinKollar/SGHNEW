import type { CurateTriviaQuestionsOutput } from "@/ai/flows/ai-question-curator";
import type { Timestamp } from "firebase/firestore";

export type Question = CurateTriviaQuestionsOutput["questions"][0];

export interface Player {
  id: string;
  name: string;
  teamName: string;
  currentQuestionIndex: number;
  // idNumber?: string; // As per user request, but let's add it later if needed.
}

export interface Team {
  name:string;
  score: number;
  players: Player[];
  capacity: number;
}

export type GameStatus = "lobby" | "starting" | "playing" | "finished";

export interface Game {
    id: string;
    status: GameStatus;
    teams: Team[];
    questions: Question[];
    createdAt: Timestamp;
    gameStartedAt?: Timestamp | null;
    timer?: number;
    topic?: string;
    difficulty?: "easy" | "medium" | "hard";
}
