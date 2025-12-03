
"use server";

import {
  curateTriviaQuestions,
  type CurateTriviaQuestionsInput,
  type CurateTriviaQuestionsOutput,
} from "@/ai/flows/ai-question-curator";

import {
  extractQuestionsFromPdf,
  type ExtractQuestionsFromPdfInput,
  type ExtractQuestionsFromPdfOutput,
} from "@/ai/flows/ai-pdf-question-extractor";

import {
    translateQuestions,
    type TranslateQuestionsInput,
    type TranslateQuestionsOutput
} from '@/ai/flows/ai-question-translator';

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


export async function extractQuestionsFromPdfAction(
  input: ExtractQuestionsFromPdfInput
): Promise<ExtractQuestionsFromPdfOutput> {
  try {
    const output = await extractQuestionsFromPdf(input);
    return output;
  } catch (error) {
    console.error("Error extracting questions from PDF:", error);
    throw new Error("Failed to extract questions from PDF via AI flow.");
  }
}

export async function translateQuestionsAction(
    input: TranslateQuestionsInput
): Promise<TranslateQuestionsOutput> {
    try {
        const output = await translateQuestions(input);
        return output;
    } catch (error) {
        console.error("Error translating questions:", error);
        throw new Error("Failed to translate questions via AI flow.");
    }
}
