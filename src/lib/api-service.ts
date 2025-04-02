import { MedicalAnalysisData, ModelProvider } from './types';

// API endpoint base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Convert a File object to a base64 encoded string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Prepare medical data for API request by converting Files to base64
 */
async function prepareMedicalData(data: MedicalAnalysisData): Promise<{
  patientName: string;
  patientAge: string;
  additionalNotes?: string;
  files: {
    name: string;
    type: string;
    size: number;
    data: string;
  }[];
}> {
  // Convert files to base64
  const filesWithBase64 = await Promise.all(
    data.files.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64
      };
    })
  );
  
  // Return formatted data for API
  return {
    patientName: data.patientName,
    patientAge: data.patientAge,
    additionalNotes: data.additionalNotes,
    files: filesWithBase64
  };
}

/**
 * Analyze medical documents using the secure backend API
 */
export async function analyzeWithBackend(
  modelProvider: ModelProvider, 
  data: MedicalAnalysisData
): Promise<string> {
  try {
    // Get the appropriate endpoint based on the model provider
    const endpoint = modelProvider === ModelProvider.OpenAI
      ? `${API_BASE_URL}/models/openai/analyze`
      : `${API_BASE_URL}/models/gemini/analyze`;
    
    // Prepare data with base64-encoded files
    const preparedData = await prepareMedicalData(data);
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preparedData),
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    // Parse and return the result
    const resultData = await response.json();
    return resultData.result;
  } catch (error) {
    console.error(`Error analyzing with ${modelProvider}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`Failed to analyze with ${modelProvider}`);
  }
} 