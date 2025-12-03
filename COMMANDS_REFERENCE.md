# Command Reference - MERN Chat

## 🚀 Quick Start Commands

### Backend Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Installing Additional Packages

### Backend

```bash
# Add new package
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Common useful packages
npm install helmet              # Security headers
npm install express-rate-limit  # Rate limiting
npm install joi                 # Input validation
npm install multer              # File uploads
npm install nodemailer          # Email sending
npm install socket.io           # Real-time communication
```

### Frontend

```bash
# Add new package
npm install package-name

# Common useful packages
npm install react-toastify      # Toast notifications
npm install date-fns            # Date utilities
npm install lodash              # Utility library
npm install react-query         # Data fetching
npm install zustand             # State management
npm install tailwindcss         # CSS framework
```

## 🔍 Development Commands

### Check for Issues

```bash
# List installed packages
npm list

# Check for outdated packages
npm outdated

# Audit for security vulnerabilities
npm audit

# Fix security vulnerabilities automatically
npm audit fix
```

### Clean Up

```bash
# Remove node_modules
rm -r node_modules          # macOS/Linux
rmdir /s node_modules       # Windows (PowerShell)

# Clear npm cache
npm cache clean --force

# Reinstall everything (after cleanup)
npm install
```

## 📝 Git Commands (if using version control)

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Commit changes
git commit -m "Your message here"

# Check status
git status

# View commit history
git log

# Create a branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# Merge branches
git merge branch-name

# View differences
git diff
```

## 🗄️ MongoDB Commands

### Using Local MongoDB

```bash
# Start MongoDB service (Windows)
mongod

# Connect to MongoDB shell
mongosh

# View all databases
show databases

# Use specific database
use mern-chat

# View all collections
show collections

# View all documents in a collection
db.users.find()

# Clear a collection
db.users.deleteMany({})

# Drop database
db.dropDatabase()
```

### Useful MongoDB Queries

```javascript
// Find user by email
db.users.findOne({ email: "user@example.com" });

// Count users
db.users.countDocuments();

// Delete specific user
db.users.deleteOne({ _id: ObjectId("...") });

// Update user
db.users.updateOne({ _id: ObjectId("...") }, { $set: { name: "New Name" } });
```

## 🧪 Testing Commands

### Run Tests (if Jest configured)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test authController.test.js

# Generate coverage report
npm test -- --coverage
```

## 🔧 Environment Setup

### Update Environment Variables

```bash
# Backend - Edit Backend/.env
MONGODB_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000

# Frontend - Create frontend/.env (if needed)
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Debugging

### Backend Debugging

```bash
# Start with debugging enabled
node --inspect server.js

# Then open chrome://inspect in Chrome
```

### Frontend Debugging

```bash
# Browser DevTools - F12 or Ctrl+Shift+I
# Check Console for errors
# Use React DevTools browser extension
# Check Network tab for API calls
# Check Application/Storage for localStorage
```

## 📊 Useful npm Scripts

### Add Custom Scripts to package.json

**Backend `package.json`:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "seed": "node scripts/seed.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

**Frontend `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest",
    "format": "prettier --write ."
  }
}
```

## 🌐 API Testing with curl

### Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirm": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🐳 Docker Commands (if using Docker)

```bash
# Build Docker image
docker build -t mern-chat-backend .

# Run container
docker run -p 5000:5000 mern-chat-backend

# View running containers
docker ps

# Stop container
docker stop container_id

# View logs
docker logs container_id
```

## 📈 Performance Commands

### Analyze Bundle Size (Frontend)

```bash
npm run build
# Check the size of frontend/dist folder
```

### Monitor Process (Backend)

```bash
# Using PM2 (install: npm install -g pm2)
pm2 start server.js
pm2 monit
pm2 logs
pm2 stop server.js
```

## 🔄 Update Commands

### Update npm Packages

```bash
# Check outdated packages
npm outdated

# Update all packages to latest
npm update

# Update to major version (use with caution)
npm install package@latest

# Check current versions
npm list
```

## 🆘 Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install --force

# Check for broken packages
npm audit

# Fix automatically
npm audit fix

# List global packages
npm list -g

# Uninstall package
npm uninstall package-name

# View package info
npm info package-name
```

## 📂 File Structure Commands

```bash
# Show directory tree (install: npm install -g tree)
tree

# List files recursively
ls -R                    # macOS/Linux
dir /s                   # Windows

# Find files
find . -name "*.js"      # Find all JS files
find . -type d           # Find all directories

# Search in files (grep)
grep -r "searchterm"     # Search in all files
grep -r "export" src/    # Search in specific folder
```

## 🎯 Useful Keyboard Shortcuts

### Both Terminal & VS Code

```
Ctrl+C          - Stop running process
Ctrl+L          - Clear screen
Ctrl+Shift+P    - Command palette (VS Code)
Ctrl+`          - Toggle terminal (VS Code)
Ctrl+K Ctrl+C   - Comment code (VS Code)
Ctrl+K Ctrl+U   - Uncomment code (VS Code)
```

## 📋 Checklist Before Deployment

```bash
# Backend
npm audit              # Check security
npm test              # Run tests
npm run build         # Build if applicable

# Frontend
npm run lint          # Check code style
npm run build         # Build for production
npm run preview       # Preview build

# General
git status            # Check for uncommitted changes
git log --oneline     # View recent commits
```

## 🚀 Full Launch Sequence

```bash
# Terminal 1 - Backend
cd Backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Open browser
http://localhost:5173

# Test the application
# 1. Go to /signup and create account
# 2. Login with credentials
# 3. View dashboard
# 4. Test logout
```

---

**Pro Tips:**

- Use `npm run` to see all available scripts
- Add `nodemon` to automatically restart backend on file changes
- Use VS Code's integrated terminal for easier workflow
- Keep a terminal open for backend and another for frontend
- Use `npm audit` regularly to maintain security
- Commit to git frequently with meaningful messages
