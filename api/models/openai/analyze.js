import { analyzeWithOpenAI } from '../../../src/server/services/modelService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Middleware to validate request body
const validateRequest = (req) => {
  const { patientName, patientAge, files } = req.body;
  
  if (!patientName || !patientAge || !files || !Array.isArray(files) || files.length === 0) {
    return { 
      error: 'Invalid request body. Required fields: patientName, patientAge, and at least one file.' 
    };
  }
  
  return null;
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Validate request
  const validationError = validateRequest(req);
  if (validationError) {
    return res.status(400).json(validationError);
  }
  
  try {
    const result = await analyzeWithOpenAI(req.body);
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
} 