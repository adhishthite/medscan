export interface MedicalAnalysisData {
  patientName: string;
  patientAge: string;
  additionalNotes?: string;
  files: File[];
}

export enum ModelProvider {
  OpenAI = "openai",
  Gemini = "gemini"
}

export interface ModelInfo {
  id: ModelProvider;
  name: string;
  description: string;
  apiKeyPlaceholder: string;
  apiKeyHelp: string;
} 