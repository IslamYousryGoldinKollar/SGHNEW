
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const TranslateQuestionsInputSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
    })),
    targetLanguage: z.enum(['en', 'ar']),
});
export type TranslateQuestionsInput = z.infer<typeof TranslateQuestionsInputSchema>;


export const TranslateQuestionsOutputSchema = z.object({
    translatedQuestions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
    })),
});
export type TranslateQuestionsOutput = z.infer<typeof TranslateQuestionsOutputSchema>;


export async function translateQuestions(input: TranslateQuestionsInput): Promise<TranslateQuestionsOutput> {
    return aiQuestionTranslatorFlow(input);
}


const prompt = ai.definePrompt({
    name: 'aiQuestionTranslatorPrompt',
    input: { schema: TranslateQuestionsInputSchema },
    output: { schema: TranslateQuestionsOutputSchema },
    prompt: `You are an expert translator specializing in creating engaging trivia content. Your task is to translate the following trivia questions into {{targetLanguage}}.

Crucial Guidelines:
1.  **Do NOT translate word-for-word.** Capture the original's intent, nuance, and tone. The goal is a natural, culturally-relevant question, not a literal translation.
2.  **Maintain Trivia Integrity:** The core facts and the correctness of the answer must be preserved. If a concept doesn't translate well, adapt it to an equivalent concept in the target culture.
3.  **Ensure Answer Accuracy:** The translated 'answer' field MUST exactly match one of the translated 'options'.
4.  **Preserve Structure:** Maintain the original order of questions and options in your response.
5.  **Arabic Specifics:** If the target language is Arabic ('ar'), ensure the text flows correctly for a Right-to-Left (RTL) context and uses modern, clear, and engaging terminology.

Input Questions:
{{{JSONstringify questions}}}
`,
});


const aiQuestionTranslatorFlow = ai.defineFlow(
    {
        name: 'aiQuestionTranslatorFlow',
        inputSchema: TranslateQuestionsInputSchema,
        outputSchema: TranslateQuestionsOutputSchema,
    },
    async (input) => {
        // Helper to stringify JSON in Handlebars
        const customRender = (template: string, context: any) => {
            const jsonContext = {
                ...context,
                JSONstringify: (obj: any) => JSON.stringify(obj, null, 2),
            };
            // Basic replacement, for a real app, use a full Handlebars library
            return template.replace(/{{{JSONstringify (\w+)}}}/g, (_, key) => {
                return jsonContext[key] ? jsonContext.JSONstringify(jsonContext[key]) : '';
            }).replace(/{{(\w+)}}/g, (_, key) => {
                 return jsonContext[key] || '';
            });
        };
        
        const { output } = await prompt(input);
        
        if (!output) {
            throw new Error("Failed to generate translations.");
        }
        
        return output;
    }
);
