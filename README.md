# AI Interview Platform

A complete AI-powered student mock interview web application that allows students to upload their resume, undergo a personalized AI interview, and receive a detailed performance report.

## Features

- User authentication (registration, login, profile management)
- Resume upload and parsing (PDF, DOC, DOCX)
- AI-powered personalized interview based on resume and profile
- Voice-based interview with speech-to-text and text-to-speech
- Webcam video during interview
- Dynamic question generation based on student's responses
- Interview progress tracking
- Detailed performance analysis and scoring
- Downloadable PDF interview report
- Dashboard to track interview history and progress

## Technology Stack

### Frontend
- React
- Tailwind CSS
- Axios for HTTP requests
- React Webcam for video capture
- JWT for authentication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Google Gemini API for AI capabilities
- JWT for authentication
- Multer for file uploads
- PDF-Parse and Mammoth for resume parsing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4 or higher)
- Google Gemini API key

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file to add your MongoDB URI and Google Gemini API key:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai_interview_platform
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. The `.env` file should contain:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```
5. Start the frontend development server:
   ```bash
   npm start
   ```

### Usage
1. Ensure both backend and frontend servers are running.
2. Open your browser and navigate to `http://localhost:3000`.
3. Click "Start Interview" to begin.
4. Register a new account or log in.
5. Upload your resume (PDF, DOC, or DOCX format).
6. Configure your interview settings.
7. Allow camera and microphone permissions when prompted.
8. Begin the interview and answer questions using your microphone.
9. After completing the interview, view your performance report and download the PDF.

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `GEMINI_API_KEY`: Google Gemini API key
- `PORT`: Port to run the server on (default: 5000)

### Frontend (.env)
- `REACT_APP_API_BASE_URL`: Base URL for API requests (default: http://localhost:5000/api)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Resume
- `POST /api/resume/upload` - Upload resume (protected)
- `GET /api/resume` - Get user's resume (protected)

### Interview
- `POST /api/interview/start` - Start a new interview (protected)
- `GET /api/interview/question/:interviewId` - Get next question (protected)
- `POST /api/interview/answer` - Submit answer (protected)
- `PUT /api/interview/complete/:interviewId` - Complete interview (protected)
- `GET /api/interview/report/:interviewId` - Get interview report (protected)

## Project Structure
```
ai-interview-platform/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       ├── contexts/       # React contexts (Auth)
│       ├── App.js          # Main app component
│       └── index.js        # Entry point
├── server/                 # Backend Node.js application
│   ├── controllers/        # Request handlers
│   ├── routes/             # API route definitions
│   ├── Models/             # Database models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── server.js           # Entry point
│   ├── .env                # Environment variables
│   └── package.json
├── uploads/                # Directory for uploaded files
├── .env                    # Backend environment variables
├── .env.example            # Example backend environment variables
├── client/.env             # Frontend environment variables
├── client/.env.example     # Example frontend environment variables
└ README.md
```

## Notes
- The application uses HTTP-only cookies for JWT storage in a production environment, but for development we use localStorage.
- In production, ensure you serve the frontend over HTTPS and set appropriate security headers.
- The Google Gemini API is used from the backend only to prevent exposing the API key.
- Resume files are stored in the `uploads` directory (not implemented in this version, but the endpoint is ready).
- The interview uses the Web Speech API for speech recognition and synthesis, which is supported in modern browsers like Chrome and Edge.

## Troubleshooting
- If you encounter CORS errors, ensure the backend CORS middleware is configured correctly.
- If the AI interview is not working, check your Google Gemini API key and ensure it has access to the Generative Language API.
- For microphone/camera issues, ensure you have granted permissions in the browser and that your devices are properly connected.