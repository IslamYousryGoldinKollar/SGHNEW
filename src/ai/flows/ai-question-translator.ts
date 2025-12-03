
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    prompt: `You are an expert localizer and content creator, specializing in adapting trivia for an Arab and Egyptian audience. Your goal is not to translate, but to recreate the questions so they feel natural, engaging, and culturally relevant.

Translate the following trivia questions into {{targetLanguage}}.

**Crucial Guidelines for Arabic ('ar') Translation:**
1.  **Think Like a Local:** Do not translate word-for-word. Understand the core concept of the question and rephrase it using common, everyday Egyptian and modern Arabic expressions. The result should sound like it was originally written in Arabic.
2.  **Cultural Adaptation:** If a concept or a name is not well-known in the Arab world, adapt it. For example, instead of a niche Western celebrity, you might reference a well-known Arab personality if it fits the question's spirit.
3.  **Maintain Factual Integrity:** While the wording is flexible, the core fact of the question and the correctness of the answer must be perfectly preserved.
4.  **Ensure Answer Accuracy:** The translated 'answer' field MUST exactly match one of the translated 'options'. This is critical.
5.  **Engaging Tone:** Write in a clear, modern, and engaging tone suitable for a fun trivia game. Avoid overly formal or academic language.

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
