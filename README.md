<div align="center">

# <strong>RESUMEZEN</strong>

*Transforming resumes, empowering career journeys effortlessly.*

<p>
  <img src="https://img.shields.io/github/last-commit/Rohan-Singhh/ResumeZen?style=for-the-badge" />
  <img src="https://img.shields.io/github/languages/top/Rohan-Singhh/ResumeZen?style=for-the-badge&color=blue" />
  <img src="https://img.shields.io/github/languages/count/Rohan-Singhh/ResumeZen?style=for-the-badge&color=blueviolet" />
  <img src="https://img.shields.io/github/repo-size/Rohan-Singhh/ResumeZen?style=for-the-badge&color=informational" />
</p>

---

### <em>Built with the tools and technologies:</em>

<p>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JSON-333?style=for-the-badge&logo=json&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/Autoprefixer-DD3735?style=for-the-badge&logo=autoprefixer&logoColor=white" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white" />
  <img src="https://img.shields.io/badge/.ENV-8D6748?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/date-fns-FF5A5F?style=for-the-badge" />
</p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [External Services Setup](#external-services-setup)
- [Development Information](#development-information)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables Guide](#environment-variables-guide)
- [License](#license)
- [Contact](#contact)

---

## 🚀 Overview

ResumeZen helps students create ATS-friendly resumes that stand out to employers. Our platform uses artificial intelligence to analyze resumes, provide real-time feedback, and offer specific suggestions for improvement.

---

## ✨ Features

- **ATS Analysis**: Score your resume against Applicant Tracking Systems using AI
- **Smart Suggestions**: Get actionable feedback to improve your resume content and format
- **PDF Processing**: Upload and process PDF resumes with OCR text extraction
- **Resume Storage**: Securely store and manage multiple resume versions
- **User Dashboard**: Track improvement history and access analysis reports
- **Subscription Plans**: Flexible pricing options for different user needs
- **Modern UI**: Responsive design with smooth animations and transitions

---

## 🛠️ Tech Stack

### Frontend
- [React.js](https://react.dev/) - User interface library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Authentication and client-side services
- [React Router](https://reactrouter.com/) - Navigation and routing
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Axios](https://axios-http.com/) - HTTP client
- [Context API](https://react.dev/reference/react/useContext) - State management

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) - Server-side Firebase integration
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication
- [Helmet](https://helmetjs.github.io/) - Secure HTTP headers

### External Services
- [OpenRouter AI](https://openrouter.ai/) - AI analysis for resume content
- [Cloudinary](https://cloudinary.com/) - Cloud storage for resume files
- [OCR Space](https://ocr.space/) - Optical Character Recognition for text extraction
- [Firebase Authentication](https://firebase.google.com/products/auth) - User authentication

---

## 🏗️ Architecture

### Backend Services

- **Authentication Service**: Firebase-based authentication with JWT tokens
- **Upload Service**: Resume file processing and Cloudinary integration
- **OCR Service**: Text extraction from PDF files
- **AI Analysis Service**: Resume evaluation using OpenRouter AI
- **Resume Parser Service**: Structured data extraction from resumes
- **Plan/Subscription Service**: User plan management

### Frontend Structure

- **Authentication Context**: User authentication state management
- **Dashboard**: Central user interface with sidebar navigation
- **Resume Analysis Components**: AI-powered resume evaluation
- **Plan Selection**: Subscription management
- **Profile Management**: User profile settings
- **PDF Utils**: Utilities for handling PDF documents

---

## 📝 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB
- [Firebase](https://console.firebase.google.com/) project (for authentication)
- [Cloudinary](https://cloudinary.com/) account (for file storage)
- [OCR Space](https://ocr.space/) API key (for text extraction)
- [OpenRouter](https://openrouter.ai/) API key (for AI analysis)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional)

### Installation

#### Manual Setup

1. Clone the repository
```bash
git clone https://github.com/Rohan-Singhh/ResumeZen.git
cd ResumeZen
```

2. Set up environment variables
   - Copy `.env.example` to `.env` in the root directory
   - Copy `.env.example` to `.env` in both `frontend` and `backend` directories
   - Update the values with your credentials

   Backend `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourAppName
   NODE_ENV=development
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
   
   # Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # OCR Space API
   OCR_SPACE_API_KEY=your_ocr_space_api_key
   
   # OpenRouter API (for AI analysis)
   OPENROUTER_API_KEY=your_openrouter_api_key
   
   # API base URL (for internal service communication)
   API_BASE_URL=http://localhost:5000
   
   # Firebase Admin SDK
   FIREBASE_ADMIN_SDK_PATH=./path-to-your-firebase-adminsdk-service-account.json
   ```

   Frontend `.env`:
   ```
   VITE_REACT_APP_FIREBASE_API_KEY="your-api-key"
   VITE_REACT_APP_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_REACT_APP_FIREBASE_PROJECT_ID="your-project-id"
   VITE_REACT_APP_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_REACT_APP_FIREBASE_APP_ID="your-app-id"
   VITE_REACT_APP_FIREBASE_MEASUREMENT_ID="your-measurement-id"
   VITE_API_URL="http://localhost:5000"
   VITE_REACT_APP_RECAPTCHA_KEY="your-recaptcha-site-key"
   VITE_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   ```

3. Install dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

4. Start development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

#### Using Docker (Recommended for Consistent Environments)

1. Clone the repository
```bash
git clone https://github.com/Rohan-Singhh/ResumeZen.git
cd ResumeZen
```

2. Set up environment variables
   - Copy `.env.example` to `.env` in the root directory
   - Update the MongoDB connection string and other service credentials

3. Start containers
```bash
docker-compose up
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔐 External Services Setup

### Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google)
3. Get your Firebase configuration from Project Settings > Your Apps > SDK setup
4. Set up Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Save the JSON file in the backend directory
   - Add the file path to your backend `.env` as FIREBASE_ADMIN_SDK_PATH

### Cloudinary Setup

1. Create a [Cloudinary account](https://cloudinary.com/users/register/free)
2. From your dashboard, get your:
   - Cloud Name
   - API Key
   - API Secret
3. Add these values to your backend `.env` file
4. Add your Cloud Name to your frontend `.env` file as VITE_CLOUDINARY_CLOUD_NAME

### OCR Space Setup

1. Sign up for an [OCR Space API key](https://ocr.space/OCRAPI)
2. Add your API key to the backend `.env` file as OCR_SPACE_API_KEY

### OpenRouter Setup

1. Create an [OpenRouter account](https://openrouter.ai/)
2. Generate an API key
3. Add your API key to the backend `.env` file as OPENROUTER_API_KEY

---

## 🧑‍💻 Development Information

### Code Organization

- **Frontend**
  - `src/components`: Reusable UI components
  - `src/pages`: Page components and views
  - `src/pages/Dashboard`: Dashboard components and layout
  - `src/services`: API service integrations
  - `src/context`: Context providers for state management
  - `src/utils`: Utility functions including PDF handling
  - `src/assets`: Static assets and images

- **Backend**
  - `services`: Core business logic and external API integrations
    - `aiAnalysisService.js`: OpenRouter AI integration for resume analysis
    - `ocrService.js`: OCR Space integration for text extraction
    - `uploadService.js`: Cloudinary integration for file storage
    - `resumeParserService.js`: Resume data extraction and formatting
  - `routes`: API endpoint definitions
  - `models`: MongoDB schemas and data models
  - `middleware`: Express middleware (auth, error handling, etc.)
  - `config`: Application configuration and setup

### Features in Detail

#### Resume Analysis
- Upload PDF resume
- Extract text with OCR
- Process resume content with AI
- Generate ATS score and improvement suggestions
- Store analysis results

#### User Authentication
- Google login integration
- Email/password authentication
- JWT token-based session management
- User profile management

#### Subscription Management
- Multiple plan options (one-time and subscription)
- Credits system for resume checks
- Premium features for higher-tier plans

---

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

---

## 🚀 Deployment

### Frontend Deployment
- [Vercel](https://vercel.com/docs)
- [Netlify](https://docs.netlify.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Backend Deployment
- [Render](https://render.com/docs)
- [Railway](https://docs.railway.app/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/)

---

## 🔧 Environment Variables Guide

### Critical Environment Variables

#### Backend Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `OCR_SPACE_API_KEY`: OCR Space API key
- `OPENROUTER_API_KEY`: OpenRouter API key
- `FIREBASE_ADMIN_SDK_PATH`: Path to Firebase Admin SDK service account JSON file

#### Frontend Variables
- Firebase configuration (API key, auth domain, project ID, etc.)
- `VITE_API_URL`: URL to your backend API
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for direct uploads
- `VITE_REACT_APP_RECAPTCHA_KEY`: reCAPTCHA site key for authentication

---

## 📄 License

Copyright © 2025 ResumeZen. All rights reserved.

---

## 👥 Contact

For questions or feedback, please reach out to the development team.