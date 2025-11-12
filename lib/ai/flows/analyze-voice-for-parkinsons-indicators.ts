'use server';
/**
 * @fileOverview Analyzes voice recordings for indicators of Parkinson's disease.
 *
 * - analyzeVoiceForParkinsonsIndicators - Analyzes voice recording and checks it against known patterns.
 * - AnalyzeVoiceInput - The input type for the analyzeVoiceForParkinsonsIndicators function.
 * - AnalyzeVoiceOutput - The return type for the analyzeVoiceFor-parkinsons-indicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  diagnoseParkinsonsVoiceComparison,
  DiagnoseParkinsonsVoiceComparisonOutput,
} from './track-historical-voice-patterns';

const AnalyzeVoiceInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A voice recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' indicating the audio format."
    ),
  historicalVoicePatterns: z
    .string()
    .optional()
    .describe('A historical record of voice patterns for comparison.'),
});
export type AnalyzeVoiceInput = z.infer<typeof AnalyzeVoiceInputSchema>;

const AnalyzeVoiceOutputSchema = z.object({
  indicators: z
    .array(z.string())
    .describe('Potential indicators of Parkinson’s disease found in the voice recording.'),
  riskLevel: z
    .enum(['Level 0', 'Level 1', 'Level 2'])
    .describe(
      'A risk level based on the number of indicators found: "Level 0" (none), "Level 1" (few), "Level 2" (multiple).'
    ),
  summary: z.string().describe('A summary of the analysis.'),
  comparisonWithHistory: z
    .string()
    .optional()
    .describe('Comparison of current voice patterns with historical data, if available.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'A score from 0 to 100 representing the confidence in the analysis based on the clarity and presence of indicators.'
    ),
  confidenceLevel: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The qualitative confidence level (Low, Medium, or High).'),
});
export type AnalyzeVoiceOutput = z.infer<typeof AnalyzeVoiceOutputSchema>;

export async function analyzeVoiceForParkinsonsIndicators(
  input: AnalyzeVoiceInput
): Promise<AnalyzeVoiceOutput> {
  return analyzeVoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVoicePrompt',
  input: {schema: z.object({audioDataUri: z.string()})},
  output: {schema: AnalyzeVoiceOutputSchema.omit({comparisonWithHistory: true})},
  prompt: `You are a specialized AI trained to analyze voice recordings for a specific set of acoustic features that *may* be associated with certain conditions. Your analysis must be based *only* on the audio data provided. Do not infer any medical conditions. Be extremely cautious and avoid false positives. Natural human speech has variations; only flag an indicator if it is clear, prominent, and persistent.

  **Your Task:**
  Analyze the provided voice recording strictly for the following five acoustic features.

  1.  **Vocal Tremor:** Is there a **clear and consistent** shaky or trembling quality in the voice? Do not flag normal fluctuations in pitch.
  2.  **Hypophonia (Softness):** Is the volume **persistently low** or does it noticeably decrease and fail to recover during speech? Do not flag a voice that is simply quiet by nature.
  3.  **Monotone Pitch:** Is the voice **consistently flat and lacking in emotional intonation** across the entire recording? Do not flag a calm or measured speaking tone.
  4.  **Dysarthria (Slurred Speech):** Is the articulation **clearly and repeatedly imprecise, slurred, or mumbled**, making it difficult to understand? Do not flag occasional mispronunciations.
  5.  **Bradykinesia in Speech (Slow Rate):** Is the speaking rate **abnormally and consistently slow**, or are there unnatural rushes of speech with inappropriate pauses?

  **Output Requirements:**

  1.  **Indicators:** Based *only* on the audio, list the specific acoustic features (from the list of five above) that you confidently detect based on the strict criteria. If no features are clearly present, return an empty array.
  2.  **Risk Level:** Based *only* on the number of indicators found, set the risk level:
      - If 0 indicators are found, set to "Level 0".
      - If 1-2 indicators are found, set to "Level 1".
      - If 3 or more indicators are found, set to "Level 2".
  3.  **Summary:** Provide a brief, evidence-based justification for your findings. For each indicator identified, describe exactly what you heard in the audio. If no indicators are found, state that the audio did not contain clear evidence of the target acoustic features.
  4.  **Confidence Score & Level:** Provide a confidence score (0-100) and assign a level ('Low', 'Medium', 'High') based on how clear and prominent the indicators are in the audio recording. A low confidence score should be assigned if the indicators are subtle or questionable.
      - **Low (0-40):** No indicators found, or indicators are very subtle and the analysis is uncertain.
      - **Medium (41-75):** One or more clear indicators are present.
      - **High (76-100):** Multiple, distinct, and prominent indicators are detected.
  
  Reference the audio using: {{media url=audioDataUri}}`,
});

const analyzeVoiceFlow = ai.defineFlow(
  {
    name: 'analyzeVoiceFlow',
    inputSchema: AnalyzeVoiceInputSchema,
    outputSchema: AnalyzeVoiceOutputSchema,
  },
  async input => {
    // Step 1: Get the basic analysis of the current audio.
    const {output: initialAnalysis} = await prompt({audioDataUri: input.audioDataUri});
    if (!initialAnalysis) {
      throw new Error('Initial voice analysis failed.');
    }

    let comparisonOutput: DiagnoseParkinsonsVoiceComparisonOutput | null = null;

    // Step 2: If there is historical data, perform a comparison.
    if (input.historicalVoicePatterns) {
      try {
        comparisonOutput = await diagnoseParkinsonsVoiceComparison({
          currentVoiceAnalysis: JSON.stringify(initialAnalysis),
          historicalVoiceData: input.historicalVoicePatterns,
        });
      } catch (error) {
        console.error('Historical comparison flow failed:', error);
        // Continue without comparison data if this step fails
      }
    }

    // Step 3: Combine the results.
    const finalResult: AnalyzeVoiceOutput = {
      ...initialAnalysis,
      // Use the trend analysis as the comparison summary.
      comparisonWithHistory: comparisonOutput ? comparisonOutput.trendAnalysis : undefined,
    };

    return finalResult;
  }
);
