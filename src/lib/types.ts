import type { CurateTriviaQuestionsOutput } from "@/ai/flows/ai-question-curator";

export type Question = CurateTriviaQuestionsOutput["questions"][0];

export interface Player {
  id: string;
  name: string;
  teamName: string;
  currentQuestionIndex: number;
}

export interface Team {
  name: string;
  score: number;
  players: Player[];
}

export type GameStatus = "lobby" | "starting" | "playing" | "finished";
