# AskTube

An AI-powered platform that transforms YouTube videos into interactive, queryable content using transcript analysis and intelligent Q&A.

## 🎯 Problem Statement

YouTube videos contain valuable information but are difficult to:
- Quickly scan for relevant content
- Search within video content
- Get answers to specific questions without watching entire videos
- Generate concise summaries of long content

## 💡 Solution

AskTube solves these problems by:
1. **Importing YouTube videos** and extracting transcripts
2. **Generating AI-powered digests** for quick content overview
3. **Enabling interactive Q&A** to ask specific questions about video content
4. **Providing source references** for all answers

## 🔄 Product Flow

```
flowchart TD
    A[Landing page] --> B[Paste YouTube URL]
    B --> C[Import Video]
    C --> D[Fetch metadata + transcript]
    D --> E[Store video + transcript]
    E --> F[Chunk transcript]
    F --> G[Create embeddings]
    G --> H[Store chunks + vectors]
    H --> I[Video ready state]

    I --> J[AI Digest button]
    J --> K[Generate summary synchronously]
    K --> L[Show digest]

    I --> M[Ask AI input]
    M --> N[Embed question]
    N --> O[Retrieve top transcript chunks]
    O --> P[Generate grounded answer]
    P --> Q[Show answer]
    Q --> M
```

## 🏗️ Architecture

### Backend (NestJS)
- **Video Import**: YouTube URL processing and transcript extraction
- **Transcript Processing**: Chunking and vector embeddings for semantic search
- **AI Integration**: Ollama for digest generation and Q&A
- **Database**: PostgreSQL with pgvector for similarity search

### Frontend (React + TypeScript)
- **Video Import Interface**: Clean URL input with loading states
- **Digest View**: AI-generated video summaries
- **Interactive Chat**: Real-time Q&A with source references
- **Responsive Design**: Mobile-friendly TailwindCSS styling

## 🛠 Tech Stack

### Backend
- **NestJS**: Node.js framework for API development
- **PostgreSQL**: Primary database with pgvector extension
- **Sequelize**: ORM for database operations
- **Ollama**: Local AI model integration
- **YouTube Transcript Plus**: Video transcript extraction

### Frontend
- **React 19**: Modern UI framework with TypeScript
- **Vite**: Fast development and build tooling
- **TailwindCSS**: Utility-first CSS framework
- **No State Management**: Simple component-based state

### DevOps
- **Docker**: Containerization support
- **TypeScript**: Type safety across the stack

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL with pgvector extension
- Ollama (for AI functionality)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd asktube
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database and Ollama settings in .env
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure API base URL if needed
npm run dev
```

### 4. Database Setup
```bash
# Run migrations
npm run migration:run
```

## 📁 Project Structure

```
asktube/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── videos/          # Video processing logic
│   │   │   ├── health/          # Health checks
│   │   │   └── config/          # Configuration
│   │   ├── common/             # Shared utilities
│   │   └── main.ts             # Application entry
│   ├── migrations/             # Database migrations
│   └── tests/                 # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # API utilities
│   │   └── App.tsx            # Main application
│   └── public/               # Static assets
└── README.md                 # This file
```

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/asktube
OLLAMA_BASE_URL=http://localhost:11434
PORT=3000
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🎯 Features

- ✅ **YouTube Video Import**: Paste URL and automatically process
- ✅ **AI Digest Generation**: Concise summaries of video content
- ✅ **Interactive Q&A**: Ask questions about video content
- ✅ **Source References**: See which transcript segments support answers
- ✅ **Real-time Processing**: Loading states and progress indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Type Safety**: Full TypeScript implementation

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

## 🔍 API Endpoints

### Videos
- `POST /videos/import` - Import YouTube video
- `POST /videos/:videoId/digest` - Generate video digest
- `POST /videos/:videoId/ask` - Ask questions about video

### Health
- `GET /health` - Application health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend port
2. **Database Connection**: Check PostgreSQL is running and pgvector is installed
3. **Ollama Connection**: Verify Ollama is running and models are downloaded
4. **YouTube Transcript Failures**: Some videos may not have available transcripts

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in environment variables.
