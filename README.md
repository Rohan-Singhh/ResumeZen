# ResumeZen Backend

Backend API for ResumeZen - AI-powered resume builder application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resumezen
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your .env file).

## Running the Application

You can start the application in two ways:

1. Development mode (with auto-reload):
```bash
npm run dev
```

2. Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile` - Get user profile (protected)
- PUT `/api/users/profile` - Update user profile (protected)

### Resumes
- POST `/api/resumes` - Create a new resume (protected)
- GET `/api/resumes` - Get all resumes for user (protected)
- GET `/api/resumes/:id` - Get single resume (protected)
- PUT `/api/resumes/:id` - Update resume (protected)
- DELETE `/api/resumes/:id` - Delete resume (protected)
- POST `/api/resumes/:id/ats-score` - Calculate ATS score (protected)

## Project Structure

```
backend/
├── server.js           # Main application entry point
├── src/
│   ├── routes/        # API routes
│   ├── models/        # Database models
│   └── middleware/    # Custom middleware
├── .env               # Environment variables
└── package.json       # Project dependencies and scripts
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## Dependencies

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing
- express-validator - Request validation
- cors - CORS middleware
- dotenv - Environment variables 