'use server';

/**
 * @fileOverview This file defines a Genkit flow for tracking historical voice patterns
 * in Parkinson's patients, comparing new voice analysis results against existing voice prints.
 *
 * @exported diagnoseParkinsonsVoiceComparison - Function to compare current voice data against historical data.
 * @exported DiagnoseParkinsonsVoiceComparisonInput - Input type for the diagnoseParkinsonsVoiceComparison function.
 * @exported DiagnoseParkinsonsVoiceComparisonOutput - Return type for the diagnoseParkinsonsVoiceComparison function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseParkinsonsVoiceComparisonInputSchema = z.object({
  currentVoiceAnalysis: z.string().describe('A JSON string of the current voice analysis data.'),
  historicalVoiceData: z.string().describe('A JSON string representing an array of historical voice data objects.'),
});
export type DiagnoseParkinsonsVoiceComparisonInput = z.infer<
  typeof DiagnoseParkinsonsVoiceComparisonInputSchema
>;

const DiagnoseParkinsonsVoiceComparisonOutputSchema = z.object({
  trendAnalysis: z
    .string()
    .describe(
      'A detailed analysis of the trend, noting changes in confidence score, number of indicators, and specific indicator patterns over time.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recommendations based on the trend, such as monitoring frequency or consulting a doctor if significant negative trends are observed.'
    ),
});
export type DiagnoseParkinsonsVoiceComparisonOutput = z.infer<
  typeof DiagnoseParkinsonsVoiceComparisonOutputSchema
>;

export async function diagnoseParkinsonsVoiceComparison(
  input: DiagnoseParkinsonsVoiceComparisonInput
): Promise<DiagnoseParkinsonsVoiceComparisonOutput> {
  return diagnoseParkinsonsVoiceComparisonFlow(input);
}

const diagnoseParkinsonsVoiceComparisonPrompt = ai.definePrompt({
  name: 'diagnoseParkinsonsVoiceComparisonPrompt',
  input: {
    schema: DiagnoseParkinsonsVoiceComparisonInputSchema,
  },
  output: {
    schema: DiagnoseParkinsonsVoiceComparisonOutputSchema,
  },
  prompt: `You are an expert in analyzing the progression of vocal indicators for Parkinson's disease.

  Analyze the trend between the historical voice data and the current voice analysis. The data is provided as JSON.

  - Identify trends in the 'confidenceScore'. Is it increasing, decreasing, or stable?
  - Track the number of 'indicators' over time. Are new indicators appearing? Are old ones disappearing?
  - Note any significant shifts in the analysis 'summary' text over time.

  Based on this trend analysis, provide a concise summary of the progression and practical recommendations for the user. Do not give medical advice, but you can suggest consulting a healthcare professional if you see a significant negative trend.

Current Voice Analysis (JSON):
{{{currentVoiceAnalysis}}}

Historical Voice Data (JSON Array):
{{{historicalVoiceData}}}
  `,
});

const diagnoseParkinsonsVoiceComparisonFlow = ai.defineFlow(
  {
    name: 'diagnoseParkinsonsVoiceComparisonFlow',
    inputSchema: DiagnoseParkinsonsVoiceComparisonInputSchema,
    outputSchema: DiagnoseParkinsonsVoiceComparisonOutputSchema,
  },
  async input => {
    const {output} = await diagnoseParkinsonsVoiceComparisonPrompt(input);
    return output!;
  }
);
