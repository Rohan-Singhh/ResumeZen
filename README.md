# ResumeZen

An affordable platform for students to optimize their resumes with ATS score analysis and actionable improvement suggestions.

## 🚀 Overview

ResumeZen helps students create ATS-friendly resumes that stand out to employers. Our platform uses AI to analyze resumes, provide real-time feedback, and offer suggestions for improvement.

## ✨ Features

- **ATS Analysis**: Score your resume against Applicant Tracking Systems
- **Smart Suggestions**: Get actionable feedback to improve your resume
- **Affordable Plans**: Budget-friendly options for students
- **User-Friendly Interface**: Simple and intuitive design

## 🛠️ Tech Stack

### Frontend
- [React.js](https://react.dev/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Authentication and client-side services
- [React Router](https://reactrouter.com/) - Navigation and routing
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Axios](https://axios-http.com/) - HTTP client

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Firebase Admin](https://firebase.google.com/docs/admin/setup) - Server-side Firebase integration
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication
- [Helmet](https://helmetjs.github.io/) - Secure HTTP headers

## 📝 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB
- [Firebase](https://console.firebase.google.com/) project (for authentication)
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

   Root `.env` (for Docker):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AppName
   ```

   Backend `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AppName
   NODE_ENV=development
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
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
   - Update the MongoDB connection string

3. Set up Docker Compose
   - Copy `docker-compose.example.yml` to `docker-compose.yml`

4. Start containers
```bash
docker-compose up
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google, Phone)
3. Get your Firebase configuration from Project Settings > Your Apps > SDK setup
4. Set up Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Save the JSON file in the backend directory
   - Add the file path to your backend `.env`

## 🧑‍💻 Development Workflow

### Code Organization

- **Frontend**
  - `src/components`: Reusable UI components
  - `src/pages`: Page components
  - `src/services`: API services
  - `src/hooks`: Custom React hooks
  - `src/context`: Context providers
  - `src/utils`: Utility functions

- **Backend**
  - `controllers`: Request handlers
  - `models`: MongoDB schemas
  - `routes`: API endpoints
  - `middleware`: Express middleware
  - `services`: Business logic
  - `utils`: Helper functions

### Working with MongoDB

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Set up a cluster and get your connection string
3. Add connection string to your `.env` files

### Resources
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [React Documentation](https://react.dev/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Documentation](https://expressjs.com/en/5x/api.html)
- [Docker Documentation](https://docs.docker.com/)

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 🚀 Deployment

### Frontend Deployment
- [Vercel](https://vercel.com/docs)
- [Netlify](https://docs.netlify.com/)

### Backend Deployment
- [Render](https://render.com/docs)
- [Railway](https://docs.railway.app/)
- [DigitalOcean](https://www.digitalocean.com/docs/)

## 📄 License

Copyright © 2025 ResumeZen

## 👥 Contact

For questions or feedback, please reach out to Rohan Singh.