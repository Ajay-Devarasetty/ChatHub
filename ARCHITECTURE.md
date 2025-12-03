# MERN Chat - Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Components: Login, Signup, Dashboard, ProtectedRoute    │   │
│  │ State: AuthContext (user, token, loading)              │   │
│  │ Storage: localStorage (token, user info)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │ HTTP Requests                       │
│                            ▼ (axios/fetch)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────┴──────────┐
                    │                    │
┌───────────────────┴──────┐   ┌────────┴──────────────┐
│   POST /api/auth/signup   │   │ POST /api/auth/login │
│   POST /api/auth/me       │   │                      │
└──────────────┬────────────┘   └──────┬───────────────┘
               │                       │
               └───────────┬───────────┘
                           ▼
           ┌───────────────────────────────┐
           │    EXPRESS SERVER (Backend)   │
           │  ┌─────────────────────────┐  │
           │  │ Routes: /api/auth/*     │  │
           │  │ Controllers: signup,    │  │
           │  │ login, getMe            │  │
           │  │ Middleware: auth (JWT)  │  │
           │  └─────────────────────────┘  │
           └──────────────┬────────────────┘
                          │
                          ▼
           ┌──────────────────────────┐
           │  MONGODB DATABASE        │
           │  ┌──────────────────────┐│
           │  │ Users Collection:    ││
           │  │ - _id                ││
           │  │ - name               ││
           │  │ - email              ││
           │  │ - password (hashed)  ││
           │  │ - timestamps         ││
           │  └──────────────────────┘│
           └──────────────────────────┘
```

## 🔄 Authentication Flow

### Sign Up Flow

```
User fills signup form
         │
         ▼
validateInput() {
  - Check all fields filled
  - Verify passwords match
  - Check password length ≥ 6
}
         │
         ▼
POST /api/auth/signup
{name, email, password, passwordConfirm}
         │
         ▼
Backend authController.signup()
         │
         ├─ Check if email exists ────→ If yes: Error
         │
         └─ Hash password with bcryptjs
           │
           ▼
         Create User in MongoDB
           │
           ▼
         Generate JWT Token
           │
           ▼
         Return {token, user}
           │
           ▼
Frontend stores token & user
           │
           ▼
Redirect to Dashboard
           │
           ▼
           ✅ Account Created & Logged In
```

### Login Flow

```
User enters email & password
         │
         ▼
validateInput() {
  - Check email provided
  - Check password provided
}
         │
         ▼
POST /api/auth/login
{email, password}
         │
         ▼
Backend authController.login()
         │
         ├─ Find user by email ──→ If not found: Error
         │
         └─ Compare password with bcryptjs.compare()
           │
           ├─ Match ────→ Generate JWT Token ─→ Return {token, user}
           │
           └─ No match ──→ Error "Invalid credentials"
                             │
                             ▼
Frontend stores token & user in localStorage
         │
         ▼
Redirect to Dashboard
         │
         ▼
         ✅ Logged In Successfully
```

### Protected Route Flow

```
User tries to access /dashboard
         │
         ▼
ProtectedRoute component checks:
  - Is token in context? ✓ / ✗
         │
         ├─ No token → Redirect to /login
         │
         └─ Token exists → Check if valid
                   │
                   ├─ Valid → Load Dashboard ✓
                   │
                   └─ Expired → Redirect to /login
                           (token removed)
```

### API Request with JWT

```
Frontend sends request to protected endpoint

GET /api/auth/me
Header: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
         │
         ▼
Backend middleware (auth.js)
         │
         ├─ Extract token from header
         │
         ├─ Verify token with JWT secret
         │
         ├─ Valid token → Extract user ID → Add to req.user
         │   │
         │   └─ Call next() → Continue to route
         │
         └─ Invalid token → Return 401 Unauthorized

Controller receives req with req.user attached
         │
         ▼
Query MongoDB for user ──→ Return user data ✓
```

## 📊 Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required, not returned in responses),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### JWT Payload

```javascript
{
  id: "user_id",           // User MongoDB _id
  iat: 1234567890,         // Issued at timestamp
  exp: 1241307890          // Expiration timestamp (7 days later)
}
```

## 🔐 Security Layers

```
Layer 1: Input Validation
├─ Email format check
├─ Password length check
└─ Required field validation

Layer 2: Password Hashing
├─ bcryptjs with 10 salt rounds
├─ Hash generated on user creation
└─ Password compared during login

Layer 3: JWT Token
├─ Token issued on successful auth
├─ Token includes user ID
├─ Token expires after 7 days
└─ Token verified on protected routes

Layer 4: Route Protection
├─ Middleware checks token validity
├─ Invalid/missing token → 401 error
└─ Valid token → Access granted

Layer 5: Storage
├─ Token in localStorage
├─ Password never exposed to frontend
└─ Sensitive data not logged
```

## 🔀 Component Communication

```
App.jsx
  │
  ├─ AuthProvider (Context)
  │   ├─ login() function
  │   ├─ signup() function
  │   ├─ logout() function
  │   └─ user, token, loading state
  │
  ├─ Router
  │   ├─ Home (public)
  │   ├─ Login (public)
  │   ├─ Signup (public)
  │   └─ ProtectedRoute
  │       └─ Dashboard (private)
  │
  └─ Components using AuthContext
      ├─ Login.jsx → useContext(AuthContext)
      ├─ Signup.jsx → useContext(AuthContext)
      ├─ Dashboard.jsx → useContext(AuthContext)
      └─ ProtectedRoute.jsx → useContext(AuthContext)
```

## 📡 Request/Response Examples

### Sign Up Request

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123",
  "passwordConfirm": "mypassword123"
}
```

### Sign Up Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzFhYjIzNDU2Nzg5MGFiY2RlZjAxMiIsImlhdCI6MTczMDU0MzIxMCwiZXhwIjoxNzMxMTQ4MDEwfQ.dGVzdHRva2Vu",
  "user": {
    "_id": "67c1ab2345678901abcdef012",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-02T10:20:10.000Z",
    "updatedAt": "2024-12-02T10:20:10.000Z"
  }
}
```

### Login Request

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

### Login Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67c1ab2345678901abcdef012",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-02T10:20:10.000Z",
    "updatedAt": "2024-12-02T10:20:10.000Z"
  }
}
```

### Get Me Request (Protected)

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Me Response

```json
{
  "success": true,
  "user": {
    "_id": "67c1ab2345678901abcdef012",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-02T10:20:10.000Z",
    "updatedAt": "2024-12-02T10:20:10.000Z"
  }
}
```

## 🚀 State Management Flow

```
Initial State:
├─ user: null
├─ token: null (or from localStorage)
└─ loading: false

User Visits App
├─ AuthContext checks localStorage
├─ If token exists → Restore it
└─ State updated

User Clicks Sign Up
├─ Form validation
├─ API call to /api/auth/signup
├─ Response received
├─ Update: token, user
├─ Store in localStorage
└─ Redirect to Dashboard

User Visits Protected Route
├─ ProtectedRoute checks token
├─ If no token → Redirect to Login
├─ If token exists → Load page
└─ Can use user data from context

User Clicks Logout
├─ Clear token from state
├─ Clear user from state
├─ Remove from localStorage
└─ Redirect to Login
```

---

This architecture ensures:
✅ **Security** - Passwords hashed, JWT verified  
✅ **Scalability** - MongoDB for data storage  
✅ **User Experience** - Smooth routing, error handling  
✅ **Maintainability** - Clear separation of concerns
