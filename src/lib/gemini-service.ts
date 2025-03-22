import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { MedicalAnalysisData } from "./types";
import { generateMedicalPrompt } from "./model-service";

// Define model to use
const MODEL = "gemini-2.0-flash";

// Maximum total size for all files in bytes (20MB)
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

// Warning threshold for file size in bytes (5MB)
const FILE_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024;

export async function analyzeWithGemini(data: MedicalAnalysisData, apiKey: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Google AI API key is required.");
    }

    // Check total file size
    const totalSize = data.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      throw new Error(`Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed (20MB). Please reduce file sizes or use fewer files.`);
    }

    // Warn about large files that might cause processing delays
    const largeFiles = data.files.filter(file => file.size > FILE_SIZE_WARNING_THRESHOLD);
    if (largeFiles.length > 0) {
      console.warn(`Processing ${largeFiles.length} large files. Analysis may take longer.`);
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Log the count and types of files for debugging
    console.log(`Processing ${data.files.length} files:`, data.files.map(f => `${f.name} (${(f.size / 1024).toFixed(2)}KB)`));

    // Convert files to appropriate format for Gemini
    const fileContents = await Promise.all(
      data.files.map(async (file) => {
        try {
          // For very large files, add extra logging
          const startTime = Date.now();
          console.log(`Starting to process file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
          
          const base64 = await fileToBase64(file);
          
          const duration = Date.now() - startTime;
          console.log(`Completed processing file: ${file.name} in ${duration}ms`);
          
          // Return the file data in Gemini compatible format
          return {
            inlineData: {
              data: base64,
              mimeType: file.type,
            },
          };
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          throw new Error(`Unable to process file "${file.name}". Please try a different file format or a smaller file.`);
        }
      })
    );

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
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
      },
    });

    // Get the standardized prompt text
    const promptText = generateMedicalPrompt(data);

    console.log(`Attempting to use model: ${MODEL}`);
    
    // Send the request to Gemini with both text and images
    const result = await chat.sendMessage([
      promptText,
      ...fileContents,
    ]);
    
    const response = await result.response;
    console.log(`Successfully used model: ${MODEL}`);
    
    // Extract and return the response content
    return response.text() || "No analysis could be generated.";
  } catch (error: unknown) {
    console.error("Error analyzing medical documents with Gemini:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Google AI API key. Please check your API key and try again.");
      } else if (error.message.includes("quota")) {
        throw new Error("Google AI API quota exceeded. Please try again later.");
      } else if (error.message.includes("not found") || error.message.includes("doesn't exist")) {
        throw new Error(`The specified model (${MODEL}) was not found. Your account might not have access to Gemini 2.0 Flash.`);
      } else if (error.message.includes("invalid") || error.message.includes("format")) {
        throw new Error("Invalid request to Gemini API. Your files may be too large or in an unsupported format.");
      } else {
        // If Google provided a specific error message, use it
        throw new Error(`Gemini error: ${error.message}`);
      }
    }
    
    // If we get here, it's an unknown error
    throw new Error("Failed to analyze medical documents. Please try again.");
  }
}

// Helper function to convert a file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // For large files, use a different approach with progress monitoring
    if (file.size > FILE_SIZE_WARNING_THRESHOLD) {
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks: Blob[] = [];
      let processedSize = 0;
      
      // Function to read file in chunks
      const readChunk = (start: number) => {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            chunks.push(new Blob([e.target.result]));
          }
          
          processedSize += (end - start);
          const progress = Math.round((processedSize / file.size) * 100);
          
          if (progress % 20 === 0) {
            console.log(`Processing large file: ${file.name} - ${progress}% complete`);
          }
          
          if (end < file.size) {
            readChunk(end);
          } else {
            // All chunks read, now combine and convert to base64
            const fullBlob = new Blob(chunks, { type: file.type });
            const finalReader = new FileReader();
            
            finalReader.onload = () => {
              if (typeof finalReader.result === "string") {
                const base64 = finalReader.result.split(",")[1];
                resolve(base64);
              } else {
                reject(new Error("Failed to convert combined chunks to base64"));
              }
            };
            
            finalReader.onerror = (event) => {
              reject(new Error(`Error converting combined chunks: ${event.target?.error?.message || "Unknown error"}`));
            };
            
            finalReader.readAsDataURL(fullBlob);
          }
        };
        
        reader.onerror = (event) => {
          reject(new Error(`Error reading chunk: ${event.target?.error?.message || "Unknown error"}`));
        };
        
        reader.readAsArrayBuffer(chunk);
      };
      
      // Start reading chunks
      readChunk(0);
    } else {
      // For smaller files, use the standard approach
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      
      reader.onerror = (event) => {
        reject(new Error(`File reading error: ${event.target?.error?.message || "Unknown error"}`));
      };
    }
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      reject(new Error("File reading timed out. The file may be too large."));
    }, 60000); // 60 seconds timeout for larger files
  });
}