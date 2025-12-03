
'use server';

/**
 * @fileOverview An AI tool for generating trivia questions.
 *
 * - generateQuestions - A function that generates trivia questions.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateQuestionsInputSchema = z.object({
  topic: z.string().describe('The main topic of the trivia questions.'),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(20)
    .describe('The number of trivia questions to generate.'),
});
export type GenerateQuestionsInput = z.infer<
  typeof GenerateQuestionsInputSchema
>;

const QuestionSchema = z.object({
  question: z.string().describe('The trivia question.'),
  options: z
    .array(z.string())
    .min(4)
    .max(4)
    .describe('An array of 4 possible answers, one of which is correct.'),
  answer: z
    .string()
    .describe(
      'The correct answer to the question. This must be one of the strings in the options array.'
    ),
});

export const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GenerateQuestionsOutput = z.infer<
  typeof GenerateQuestionsOutputSchema
>;

export async function generateQuestions(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an expert trivia question creator. Your task is to generate {{numberOfQuestions}} multiple-choice trivia questions on the topic of "{{topic}}".

Each question must have exactly 4 options.
One of the options must be the correct answer.
The 'answer' field must exactly match one of the strings in the 'options' array.

The output must be a valid JSON object containing an array of question objects.
`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate questions.');
    }
    return output;
  }
);
