// Medical data type
export interface MedicalFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded file data
}

export interface MedicalAnalysisData {
  patientName: string;
  patientAge: string;
  additionalNotes?: string;
  files: MedicalFile[];
}

// API response types
export interface AnalysisResponse {
  result: string;
}

export interface ErrorResponse {
  error: string;
} 