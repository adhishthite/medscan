# MedScan

A React TypeScript application built with Vite and Express backend.

## Prerequisites

- Node.js (version 16 or higher)
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/medscan.git
cd medscan
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:
- `OPENAI_API_KEY` - Your OpenAI API key
- `GEMINI_API_KEY` - Your Google Gemini API key
- `VITE_AUTH_KEYS` - Comma-separated list of authentication keys

## Running the Application

### Development Mode

To run both the frontend and backend concurrently:

```bash
npm start
```

This command will start:

- The React frontend (Vite development server) at `http://localhost:5173` by default
- The Express backend server at `http://localhost:3001`

### Other Available Commands

```bash
# Run only the frontend
npm run dev

# Run only the backend
npm run server

# Build the application for production
npm run build

# Preview the production build
npm run preview
```

## Technologies Used

- **Frontend**:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS
  - Radix UI components
  - React Hook Form
  - Zod validation

- **Backend**:
  - Express
  - TypeScript
  - LangChain
  - OpenAI and Google Generative AI integrations

## Project Structure

```
medscan/
├── api/                # Server API endpoints for Vercel deployments
│   └── models/         # Model-specific API handlers
├── public/             # Static assets served by Vite
├── src/                # Source code
│   ├── assets/         # Images, fonts, and other static assets
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and shared code
│   ├── pages/          # Application pages/views
│   ├── server/         # Express server code
│   │   ├── routes/     # API route definitions
│   │   ├── services/   # Business logic services
│   │   └── types/      # TypeScript type definitions
│   ├── App.css         # Main application styles
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global CSS styles
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type declarations
├── .env.example        # Example environment variables
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── vercel.json         # Vercel deployment configuration
```
