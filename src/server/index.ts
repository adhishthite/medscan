import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { modelRouter } from './routes/modelRoutes';

// Load environment variables
dotenv.config();

// Create Express server
const app = express();
const port = process.env.PORT || 3001;

// Apply security middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API routes
app.use('/api/models', modelRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; 