"use server";

import {
  curateTriviaQuestions,
  type CurateTriviaQuestionsInput,
  type CurateTriviaQuestionsOutput,
} from "@/ai/flows/ai-question-curator";

export async function generateQuestionsAction(
  input: CurateTriviaQuestionsInput
): Promise<CurateTriviaQuestionsOutput> {
  try {
    const output = await curateTriviaQuestions(input);
    return output;
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return a structured error or re-throw
    throw new Error("Failed to generate questions via AI flow.");
  }
}
