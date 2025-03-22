import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { MedicalAnalysisData } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define models to use
const OPENAI_MODEL = 'gpt-4o';
const GEMINI_MODEL = 'gemini-2.0-flash';

// Get API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Maximum total size for all files in bytes (20MB)
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

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

Format the report in Markdown with proper headings, lists, and emphasis where appropriate.`;
}

/**
 * Analyze medical documents with OpenAI
 */
export async function analyzeWithOpenAI(data: MedicalAnalysisData): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured on the server.');
    }

    // Check total file size
    const totalSize = data.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      throw new Error(`Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed (20MB).`);
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ 
      apiKey: OPENAI_API_KEY,
      maxRetries: 3,
      timeout: 300000, // 5 minutes
    });

    // Prepare files for OpenAI format
    const fileContents = data.files.map(file => {
      return {
        type: "image_url" as const,
        image_url: {
          url: `data:${file.type};base64,${file.data}`,
        },
      };
    });

    // Get the standardized prompt
    const promptText = generateMedicalPrompt(data);

    // Construct the message content with proper typing
    const content = [
      {
        type: "text" as const,
        text: promptText,
      },
      ...fileContents,
    ];
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.2,
    });
    
    // Check if we received a proper response
    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response received from OpenAI.");
    }
    
    // Extract and return the response content
    return response.choices[0]?.message?.content || "No analysis could be generated.";
  } catch (error) {
    console.error("Error analyzing medical documents with OpenAI:", error);
    
    // Re-throw with specific error message
    throw error instanceof Error 
      ? error 
      : new Error("Failed to analyze medical documents with OpenAI.");
  }
}

/**
 * Analyze medical documents with Gemini
 */
export async function analyzeWithGemini(data: MedicalAnalysisData): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured on the server.');
    }

    // Check total file size
    const totalSize = data.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      throw new Error(`Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed (20MB).`);
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Prepare files for Gemini format
    const fileContents = data.files.map(file => {
      return {
        inlineData: {
          data: file.data,
          mimeType: file.type,
        },
      };
    });

    // Set safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Create a chat instance
    const chat = model.startChat({
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
      },
    });

    // Get the standardized prompt text
    const promptText = generateMedicalPrompt(data);
    
    // Send the request to Gemini with both text and images
    const result = await chat.sendMessage([
      promptText,
      ...fileContents,
    ]);
    
    const response = await result.response;
    
    // Extract and return the response content
    return response.text() || "No analysis could be generated.";
  } catch (error) {
    console.error("Error analyzing medical documents with Gemini:", error);
    
    // Re-throw with specific error message
    throw error instanceof Error 
      ? error 
      : new Error("Failed to analyze medical documents with Gemini.");
  }
} 