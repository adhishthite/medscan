import { MedicalAnalysisData, ModelProvider } from "./types";
import { analyzeMedicalDocuments } from "./openai-service";
import { analyzeWithGemini } from "./gemini-service";
import { analyzeWithBackend } from "./api-service";

// Flag to control whether to use the secure backend (true) or direct client-side API calls (false)
const USE_SECURE_BACKEND = true;

export const MODELS = [
  {
    id: ModelProvider.OpenAI,
    name: "OpenAI GPT-4o",
    description: "Advanced multimodal model from OpenAI with strong performance on medical imagery.",
    apiKeyPlaceholder: USE_SECURE_BACKEND ? "Not required (using secure backend)" : "Enter your OpenAI API key",
    apiKeyHelp: USE_SECURE_BACKEND ? "API keys are securely stored on the server." : "Requires access to the GPT-4o model."
  },
  {
    id: ModelProvider.Gemini,
    name: "Google Gemini 2.0 Flash",
    description: "Fast multimodal model from Google with good performance on medical analysis.",
    apiKeyPlaceholder: USE_SECURE_BACKEND ? "Not required (using secure backend)" : "Enter your Google AI API key",
    apiKeyHelp: USE_SECURE_BACKEND ? "API keys are securely stored on the server." : "Requires access to the Gemini 2.0 Flash model."
  }
];

/**
 * Generates a consistent prompt for medical analysis across different models
 */
export function generateMedicalPrompt(data: MedicalAnalysisData): string {
  return `You are a medical expert, but not a doctor. Your task is to analyze the attached medical documents and assist the doctor in diagnosing the patient.
  The doctor's vote is the final answer. But you can help the doctor by providing your analysis and recommendations.
  
  Generate a detailed medical analysis report based on these documents.
          
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

Format the report in Markdown with proper headings, lists, and emphasis where appropriate.

NOTE: WE WANT ONLY THE REPORT, NOT ANYTHING ELSE.`;
}

export async function analyzeWithModel(
  modelProvider: ModelProvider, 
  data: MedicalAnalysisData, 
  apiKey: string
): Promise<string> {
  // If using the secure backend, ignore the API key and call through the backend
  if (USE_SECURE_BACKEND) {
    return analyzeWithBackend(modelProvider, data);
  }

  // Otherwise, use the direct client-side API calls
  switch (modelProvider) {
    case ModelProvider.OpenAI:
      return analyzeMedicalDocuments(data, apiKey);
    case ModelProvider.Gemini:
      return analyzeWithGemini(data, apiKey);
    default:
      throw new Error(`Unknown model provider: ${modelProvider}`);
  }
} 