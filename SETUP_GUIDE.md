# MERN Chat Application - Setup Guide

This is a full-stack MERN (MongoDB, Express, React, Node.js) application with JWT authentication and password hashing.

## Features

✅ User Registration (Sign Up)  
✅ User Login  
✅ Password Hashing with bcryptjs  
✅ JWT Token-based Authentication  
✅ Protected Routes  
✅ User Dashboard  
✅ Responsive UI Design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `Backend` folder with:

```
MONGODB_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
```

**Important:** Change `JWT_SECRET` to a strong, random string in production.

For MongoDB Atlas, replace `MONGODB_URI` with your connection string:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-chat
```

### 3. Start the Backend Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`

Register a new user

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`

Login user

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/auth/me`

Get current logged-in user (Protected Route)

Header:

```
Authorization: Bearer jwt_token_here
```

Response:

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Project Structure

```
Backend/
├── config/
│   └── db.js (MongoDB connection)
├── controllers/
│   └── authController.js (Auth logic)
├── middleware/
│   └── auth.js (JWT verification)
├── models/
│   └── User.js (User schema with password hashing)
├── routes/
│   └── auth.js (Auth routes)
├── server.js (Express server)
├── .env (Environment variables)
└── package.json

frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx (Route protection)
│   ├── context/
│   │   └── AuthContext.jsx (Authentication context)
│   ├── pages/
│   │   ├── Home.jsx (Landing page)
│   │   ├── Login.jsx (Login page)
│   │   ├── Signup.jsx (Sign up page)
│   │   └── Dashboard.jsx (User dashboard)
│   ├── styles/
│   │   ├── Auth.css (Login/Signup styles)
│   │   ├── Dashboard.css (Dashboard styles)
│   │   └── Home.css (Home page styles)
│   ├── App.jsx (Main app with routing)
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Key Features Explained

### Password Hashing

Passwords are hashed using `bcryptjs` before being stored in the database. The `comparePassword` method is used during login to verify the password.

### JWT Authentication

A JWT token is issued upon successful signup/login and must be included in the `Authorization` header for protected routes.

### Protected Routes

The `ProtectedRoute` component checks if a user has a valid JWT token. If not, they are redirected to the login page.

### Authentication Context

The `AuthContext` manages the authentication state across the application, providing user data and authentication methods to all components.

## Testing the Application

1. **Sign Up**: Go to `http://localhost:5173/signup` and create a new account
2. **Login**: Go to `http://localhost:5173/login` and login with your credentials
3. **Dashboard**: After login, you'll be redirected to the dashboard showing user information
4. **Logout**: Click the logout button to log out

## Security Notes

- Always use HTTPS in production
- Keep `JWT_SECRET` secure and unique for each environment
- Never commit `.env` file to version control
- Use environment-specific configuration
- Implement rate limiting for auth endpoints in production
- Add input validation and sanitization
- Consider adding email verification

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running locally or check your Atlas connection string
- Verify `MONGODB_URI` in `.env` is correct

### CORS Error

- The backend has CORS enabled for all origins (for development)
- In production, specify the exact frontend URL

### Token Expiration

- Tokens expire after 7 days (configurable via `JWT_EXPIRE`)
- User will need to login again after token expiration

## Future Enhancements

- Email verification
- Password reset functionality
- Two-factor authentication
- User profile management
- Real-time messaging
- Social login (Google, GitHub, etc.)

## License

ISC
