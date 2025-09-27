'use server';

/**
 * @fileOverview An AI tool for extracting trivia questions from a PDF document.
 *
 * - extractQuestionsFromPdf - A function that handles the PDF question extraction process.
 * - ExtractQuestionsFromPdfInput - The input type for the extractQuestionsFromPdf function.
 * - ExtractQuestionsFromPdfOutput - The return type for the extractQuestionsFrom-pdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('The trivia question.'),
  options: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('An array of 2 to 4 possible answers.'),
  answer: z
    .string()
    .describe(
      'The correct answer to the question. This must be one of the strings in the options array.'
    ),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the question.'),
  topic: z.string().describe('The topic of the question.'),
});

const ExtractQuestionsFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document containing trivia questions, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  topic: z
    .string()
    .describe('The default topic to assign to the extracted questions.'),
});
export type ExtractQuestionsFromPdfInput = z.infer<
  typeof ExtractQuestionsFromPdfInputSchema
>;

const ExtractQuestionsFromPdfOutputSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .describe('An array of extracted multiple-choice trivia questions.'),
});
export type ExtractQuestionsFromPdfOutput = z.infer<
  typeof ExtractQuestionsFromPdfOutputSchema
>;

export async function extractQuestionsFromPdf(
  input: ExtractQuestionsFromPdfInput
): Promise<ExtractQuestionsFromPdfOutput> {
  return extractQuestionsFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractQuestionsFromPdfPrompt',
  input: {schema: ExtractQuestionsFromPdfInputSchema},
  output: {schema: ExtractQuestionsFromPdfOutputSchema},
  prompt: `You are an expert data extractor. Your task is to analyze the provided PDF document and extract all the multiple-choice trivia questions you can find.

The user has specified that the general topic for these questions is '{{topic}}'. You should use this as the topic for the extracted questions unless the document specifies a different topic for a particular question.

For each question, you must identify:
- The question itself.
- The available options (must be between 2 and 4).
- The correct answer. The 'answer' field must exactly match one of the options.
- The difficulty level ('easy', 'medium', 'hard'). If the difficulty is not specified, make a reasonable guess based on the question's content.

The PDF document is provided below:
{{media url=pdfDataUri}}

The output must be a valid JSON object containing an array of question objects. Adhere strictly to the output schema.
`,
});

const extractQuestionsFromPdfFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFromPdfFlow',
    inputSchema: ExtractQuestionsFromPdfInputSchema,
    outputSchema: ExtractQuestionsFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
