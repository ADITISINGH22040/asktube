# AskTube Frontend

A clean, minimal React frontend for the AskTube backend API that allows users to import YouTube videos and interact with them through AI-powered digests and Q&A.

## Features

- **YouTube Video Import**: Import YouTube videos with a clean, simple interface
- **Video Digest**: Generate AI-powered summaries of video content
- **Interactive Q&A**: Ask questions about video content with contextual answers
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Loading States**: Clear feedback during API operations
- **Error Handling**: User-friendly error messages and retry mechanisms

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for clean, modern styling
- **No external state management** - uses React component state only

## Prerequisites

- Node.js 18+ 
- Backend API server running (default: http://localhost:3000)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment file and configure as needed:

```bash
cp .env.example .env
```

Edit `.env` if your backend is running on a different port:
```
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Import a Video**: 
   - Paste a YouTube URL in the input field
   - Click "Import Video"
   - Wait for the import to complete (this may take a minute)

2. **View Digest**:
   - After import, click the "Digest" tab
   - View the AI-generated summary of the video

3. **Ask Questions**:
   - Switch to the "Ask AI" tab
   - Type questions about the video content
   - Get contextual answers with source references

## API Integration

The frontend integrates with these backend endpoints:

- `POST /videos/import` - Import YouTube video
- `POST /videos/:videoId/digest` - Generate video digest
- `POST /videos/:videoId/ask` - Ask questions about video

## Project Structure

```
src/
├── components/
│   ├── ImportView.tsx      # Initial video import interface
│   └── MainView.tsx        # Main interaction screen with tabs
├── types/
│   └── api.ts             # TypeScript type definitions
├── utils/
│   └── api.ts             # API utility functions and error handling
├── App.tsx                # Main application component
└── index.css              # TailwindCSS styles
```

## Development Notes

- The application uses React component state only - no global state management
- All API calls include proper error handling and user feedback
- Loading states are implemented for all async operations
- The UI is fully responsive and follows modern design principles
- TypeScript is used throughout for type safety

## Troubleshooting

### Common Issues

1. **"Network error" when importing videos**
   - Ensure the backend server is running
   - Check that `VITE_API_BASE_URL` is correctly configured

2. **TailwindCSS styles not loading**
   - Verify that dependencies are installed
   - Restart the development server

3. **TypeScript errors**
   - Ensure all dependencies are up to date
   - Check that environment variables are properly configured
