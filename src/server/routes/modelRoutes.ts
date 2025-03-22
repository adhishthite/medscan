import express from 'express';
import { analyzeWithOpenAI, analyzeWithGemini } from '../services/modelService';

export const modelRouter = express.Router();

// Middleware to validate request body
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { patientName, patientAge, files } = req.body;
  
  if (!patientName || !patientAge || !files || !Array.isArray(files) || files.length === 0) {
    res.status(400).json({ 
      error: 'Invalid request body. Required fields: patientName, patientAge, and at least one file.' 
    });
    return;
  }
  
  next();
};

// OpenAI analysis endpoint
modelRouter.post('/openai/analyze', validateRequest, async (req, res) => {
  try {
    const result = await analyzeWithOpenAI(req.body);
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

// Gemini analysis endpoint
modelRouter.post('/gemini/analyze', validateRequest, async (req, res) => {
  try {
    const result = await analyzeWithGemini(req.body);
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}); 