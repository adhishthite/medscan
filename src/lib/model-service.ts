import { MedicalAnalysisData, ModelProvider } from "./types";
import { analyzeMedicalDocuments } from "./openai-service";
import { analyzeWithGemini } from "./gemini-service";

export const MODELS = [
  {
    id: ModelProvider.OpenAI,
    name: "OpenAI GPT-4o",
    description: "Advanced multimodal model from OpenAI with strong performance on medical imagery.",
    apiKeyPlaceholder: "Enter your OpenAI API key",
    apiKeyHelp: "Requires access to the GPT-4o model."
  },
  {
    id: ModelProvider.Gemini,
    name: "Google Gemini 2.0 Flash",
    description: "Fast multimodal model from Google with good performance on medical analysis.",
    apiKeyPlaceholder: "Enter your Google AI API key",
    apiKeyHelp: "Requires access to the Gemini 2.0 Flash model."
  }
];

/**
 * Generates a consistent prompt for medical analysis across different models
 */
export function generateMedicalPrompt(data: MedicalAnalysisData): string {
  return `Generate a detailed medical analysis report based on these documents.
          
Patient Information:
- Name: ${data.patientName}
- Age: ${data.patientAge}
${data.additionalNotes ? `- Additional Notes: ${data.additionalNotes}` : ''}

Analyze the attached medical documents and provide a comprehensive report including:
1. Patient Information
2. Findings and Observations
3. Diagnosis (if possible)
4. Recommendations
5. Follow-up requirements

Format the report in Markdown with proper headings, lists, and emphasis where appropriate.`;
}

export async function analyzeWithModel(
  modelProvider: ModelProvider, 
  data: MedicalAnalysisData, 
  apiKey: string
): Promise<string> {
  switch (modelProvider) {
    case ModelProvider.OpenAI:
      return analyzeMedicalDocuments(data, apiKey);
    case ModelProvider.Gemini:
      return analyzeWithGemini(data, apiKey);
    default:
      throw new Error(`Unknown model provider: ${modelProvider}`);
  }
} 