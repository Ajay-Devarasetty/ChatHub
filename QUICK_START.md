# Quick Start Guide - MERN Chat Authentication

## 🚀 Get Started in 5 Minutes

### Step 1: Install Backend Dependencies

```bash
cd Backend
npm install
```

### Step 2: Configure MongoDB

Edit `Backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_secure_random_string
JWT_EXPIRE=7d
PORT=5000
```

**Need MongoDB?**

- Local: Download from https://www.mongodb.com/try/download/community
- Cloud: Sign up at https://www.mongodb.com/cloud/atlas (free)

### Step 3: Start Backend Server

```bash
cd Backend
npm run dev
```

✅ Backend running on http://localhost:5000

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

✅ Frontend running on http://localhost:5173

## 📝 Test the Application

### Create an Account

1. Go to http://localhost:5173
2. Click "Get Started" or navigate to `/signup`
3. Fill in name, email, and password
4. Submit the form

### Login

1. Go to `/login`
2. Enter your email and password
3. You'll be redirected to the dashboard

### View Dashboard

- See your user information
- Click "Logout" to sign out

## 🔐 What's Included

✅ **User Registration** with form validation  
✅ **Password Hashing** using bcryptjs  
✅ **JWT Authentication** with 7-day expiration  
✅ **Protected Routes** - Dashboard requires login  
✅ **Responsive Design** - Works on all devices  
✅ **Error Handling** - User-friendly error messages  
✅ **Auth Context** - Global state management

## 📂 File Structure

```
Backend/
  ├── models/User.js (Database schema + hashing)
  ├── controllers/authController.js (Login/Signup logic)
  ├── routes/auth.js (API routes)
  ├── middleware/auth.js (JWT verification)
  ├── config/db.js (MongoDB connection)
  ├── server.js (Express setup)
  └── .env (Configuration)

frontend/
  ├── pages/
  │   ├── Home.jsx
  │   ├── Login.jsx
  │   ├── Signup.jsx
  │   └── Dashboard.jsx
  ├── context/AuthContext.jsx (Auth state)
  ├── components/ProtectedRoute.jsx (Route protection)
  └── styles/ (CSS files)
```

## 🛠️ Key Technologies

**Backend:**

- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens

**Frontend:**

- React 19 - UI library
- React Router v6 - Navigation
- Axios - HTTP client (ready to use)
- CSS - Styling

## 🔧 Troubleshooting

| Issue                    | Solution                                                     |
| ------------------------ | ------------------------------------------------------------ |
| "Cannot find module"     | Run `npm install` in the folder                              |
| MongoDB connection error | Ensure MongoDB is running or check Atlas credentials         |
| CORS error               | Backend CORS is configured - check frontend URL in requests  |
| Blank page               | Check browser console for errors, ensure servers are running |

## 📚 Next Steps

1. **Add Email Verification** - Confirm user emails
2. **Password Reset** - Allow users to reset forgotten passwords
3. **User Profile** - Let users edit their profile
4. **Real-time Chat** - Add Socket.io for messaging
5. **Social Login** - Add Google/GitHub authentication

## 🚨 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Never commit `.env` to Git
- [ ] Use HTTPS in production
- [ ] Add rate limiting for auth endpoints
- [ ] Implement email verification
- [ ] Add input validation/sanitization
- [ ] Use HTTPS for database connections

## 📞 API Reference

**POST** `/api/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**GET** `/api/auth/me` (Add header: `Authorization: Bearer <token>`)

## ✅ You're All Set!

Your MERN authentication system is ready to use. Happy coding! 🎉
