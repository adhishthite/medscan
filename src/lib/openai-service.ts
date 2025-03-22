import OpenAI from "openai";

export interface MedicalAnalysisData {
  patientName: string;
  patientAge: string;
  additionalNotes?: string;
  files: File[];
}

// Define model to use
const MODEL = "o3-mini";

// Maximum total size for all files in bytes (20MB)
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

// Warning threshold for file size in bytes (5MB)
const FILE_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024;

export async function analyzeMedicalDocuments(data: MedicalAnalysisData, apiKey: string): Promise<string> {
  try {
    if (!apiKey.startsWith("sk-")) {
      throw new Error("Invalid API key format. OpenAI keys should start with 'sk-'.");
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

    // Initialize OpenAI client with extended timeout for large files
    const openai = new OpenAI({ 
      apiKey,
      maxRetries: 3,
      timeout: 300000, // 5 minutes
      dangerouslyAllowBrowser: true // Allow usage in browser environments
    });

    // Log the count and types of files for debugging
    console.log(`Processing ${data.files.length} files:`, data.files.map(f => `${f.name} (${(f.size / 1024).toFixed(2)}KB)`));

    // Convert files to base64
    const fileContents = await Promise.all(
      data.files.map(async (file) => {
        try {
          // For very large files, add extra logging
          const startTime = Date.now();
          console.log(`Starting to process file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
          
          const base64 = await fileToBase64(file);
          
          const duration = Date.now() - startTime;
          console.log(`Completed processing file: ${file.name} in ${duration}ms`);
          
          return {
            type: "image_url" as const,
            image_url: {
              url: `data:${file.type};base64,${base64}`,
            },
          };
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          throw new Error(`Unable to process file "${file.name}". Please try a different file format or a smaller file.`);
        }
      })
    );

    // Construct the message content with proper typing
    const content = [
      {
        type: "text" as const,
        text: `Generate a detailed medical analysis report based on these documents.
          
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

Format the report in Markdown.`,
      },
      ...fileContents,
    ];

    console.log(`Attempting to use model: ${MODEL}`);
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.2,
    });
    
    // If we get here, the API call was successful
    console.log(`Successfully used model: ${MODEL}`);
    
    // Check if we received a proper response
    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response received from OpenAI. Please try again.");
    }
    
    // Extract and return the response content
    return response.choices[0]?.message?.content || "No analysis could be generated.";
  } catch (error: unknown) {
    console.error("Error analyzing medical documents:", error);
    
    // Handle specific OpenAI API errors
    if (typeof error === 'object' && error !== null) {
      const apiError = error as { status?: number; message?: string };
      
      if (apiError.status === 401) {
        throw new Error("Invalid or expired API key. Please check your OpenAI API key and try again.");
      } else if (apiError.status === 429) {
        throw new Error("OpenAI API rate limit exceeded. Please try again later.");
      } else if (apiError.status === 404) {
        throw new Error(`The specified model (${MODEL}) was not found. Your account might not have access to GPT-4o.`);
      } else if (apiError.status === 400) {
        throw new Error("Invalid request to OpenAI API. Your files may be too large or in an unsupported format.");
      } else if (apiError.message) {
        // If OpenAI provided a specific error message, use it
        throw new Error(`OpenAI error: ${apiError.message}`);
      }
    }
    
    // If we get here, it's an unknown error
    if (error instanceof Error) {
      throw new Error(`Error: ${error.message}`);
    }
    
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