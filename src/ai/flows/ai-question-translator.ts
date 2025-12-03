
import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});

export const TranslateQuestionsInput = z.object({
    questions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
    })),
    targetLanguage: z.enum(['en', 'ar']),
});

export const TranslateQuestionsOutput = z.object({
    translatedQuestions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
    })),
});

export const aiQuestionTranslator = ai.defineFlow(
    {
        name: 'aiQuestionTranslator',
        inputSchema: TranslateQuestionsInput,
        outputSchema: TranslateQuestionsOutput,
    },
    async (input) => {
        const { questions, targetLanguage } = input;

        const prompt = `
        You are an expert translator with a deep understanding of cultural nuances.
        Translate the following trivia questions into ${targetLanguage === 'ar' ? 'Arabic' : 'English'}.
        
        Guidelines:
        - Do NOT translate word-for-word. Instead, convey the meaning naturally and accurately.
        - Consider the local culture and context for the target language.
        - Ensure the "correct answer" remains correct in the translated version.
        - Maintain the same order of questions and options.
        - If the target language is Arabic, ensure the text flows correctly (RTL context) and uses appropriate terminology.

        Input Questions:
        ${JSON.stringify(questions, null, 2)}
        `;

        const { output } = await ai.generate({
            prompt: prompt,
            output: {
                format: "json",
                schema: TranslateQuestionsOutput
            }
        });

        if (!output) {
            throw new Error("Failed to generate translations.");
        }

        return output;
    }
);
