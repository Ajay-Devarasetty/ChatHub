# 🐛 Troubleshooting Guide - MERN Chat

## Common Errors & Solutions

### 🔴 MongoDB Connection Errors

#### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB not running or wrong connection string

**Solutions:**

1. **Local MongoDB**

   ```bash
   # Windows (PowerShell as Admin)
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

2. **Using MongoDB Atlas (Cloud)**

   - Update `Backend/.env`:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-chat?retryWrites=true&w=majority
   ```

   - Replace username, password, cluster name

3. **Verify Connection**
   ```bash
   # Test with mongosh
   mongosh
   ```

---

### 🔴 Port Already in Use

#### Error: "EADDRINUSE: address already in use :::5000"

**Cause:** Another process using port 5000

**Solutions:**

**Windows (PowerShell):**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID [PID] /F

# Or change port in Backend/.env
PORT=5001
```

**macOS/Linux:**

```bash
# Find process
lsof -i :5000

# Kill the process
kill -9 [PID]

# Or change port in Backend/.env
PORT=5001
```

---

### 🔴 npm install Fails

#### Error: "npm ERR! code ERESOLVE"

**Cause:** Dependency conflicts

**Solution:**

```bash
# Clear cache
npm cache clean --force

# Remove node_modules and lock file
rm -r node_modules package-lock.json

# Install with legacy peer deps flag
npm install --legacy-peer-deps

# Or if that fails
npm install --force
```

---

### 🔴 Module Not Found Errors

#### Error: "Cannot find module 'mongoose'"

**Cause:** Dependencies not installed

**Solution:**

```bash
# In Backend folder
cd Backend
npm install

# Verify installation
npm list mongoose
```

#### Error: "Cannot find module 'react-router-dom'"

**Cause:** Frontend dependencies not installed

**Solution:**

```bash
# In frontend folder
cd frontend
npm install

# Verify installation
npm list react-router-dom
```

---

### 🔴 CORS Errors

#### Error: "Access to XMLHttpRequest from origin blocked by CORS policy"

**Cause:** Backend CORS not configured

**Solutions:**

Already configured in `Backend/server.js`:

```javascript
app.use(cors());
```

If still getting error:

1. Check backend is running on port 5000
2. Check frontend is requesting to http://localhost:5000
3. Verify no typos in API URL

To restrict CORS (production):

```javascript
app.use(
  cors({
    origin: "https://your-frontend-domain.com",
    credentials: true,
  })
);
```

---

### 🔴 Login/Signup Failures

#### Error: "Email already exists"

**Cause:** User already registered with that email

**Solution:**

- Use a different email address
- Or delete user from MongoDB:
  ```javascript
  db.users.deleteOne({ email: "email@example.com" });
  ```

#### Error: "Invalid email or password"

**Cause:** Wrong credentials

**Solutions:**

1. Check email is correct (case-sensitive)
2. Check password is correct
3. Verify user exists in database:
   ```javascript
   db.users.findOne({ email: "your@email.com" });
   ```

#### Error: "Password and passwordConfirm do not match"

**Cause:** Passwords don't match during signup

**Solution:**

- Ensure both password fields have identical text
- No extra spaces before or after

#### Error: "Password should be at least 6 characters"

**Cause:** Password too short

**Solution:**

- Enter password with at least 6 characters

---

### 🔴 Authentication Issues

#### Error: "Not authorized to access this route"

**Cause:** Missing or invalid JWT token

**Solutions:**

1. **Token expired** (after 7 days)

   - Login again to get new token

2. **No token in localStorage**

   - Check browser DevTools → Application → localStorage
   - Token should be there after login

3. **Token malformed**

   - Try logout and login again
   - Clear localStorage: `localStorage.clear()`

4. **Backend not running**
   - Start backend: `cd Backend && npm run dev`

---

### 🔴 Frontend Issues

#### Blank White Screen

**Solutions:**

1. Check browser console (F12) for errors
2. Verify backend is running
3. Check frontend is running on 5173
4. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

#### Page Not Found (404)

**Solution:**

- Verify you're at http://localhost:5173 (not 5000)
- Check routing in `App.jsx`

#### Styles Not Loading

**Solution:**

```bash
# Clear Vite cache
rm -r frontend/node_modules/.vite
npm run dev
```

#### Can't Click Buttons

**Cause:** JS not loaded or errors in console

**Solution:**

1. Open DevTools (F12)
2. Check Console tab for errors
3. Fix errors and refresh page

---

### 🔴 Backend Issues

#### Error: "Cannot start listening on port 5000"

**Solution:**

```bash
# Change port in Backend/.env
PORT=5001

# Restart server
npm run dev
```

#### Backend crashes after startup

**Check error message:**

```bash
# See full error in terminal
# Common cause: Missing dependencies
npm install
npm run dev
```

#### Database errors after making requests

**Solutions:**

1. Ensure MongoDB connection string is correct
2. Check user model matches queries
3. Verify database exists

---

### 🔴 Git/Version Control Issues

#### Error: "fatal: not a git repository"

**Cause:** Git not initialized

**Solution:**

```bash
git init
git add .
git commit -m "Initial commit"
```

#### Large file warning

**Solution:**

```bash
# Add .env to .gitignore
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
```

---

### 🔴 Environment Variable Issues

#### Error: "JWT_SECRET is undefined"

**Cause:** Missing .env file or variable

**Solution:**

```bash
# Create .env in Backend folder with:
MONGODB_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
```

#### Error: ".env file not found"

**Solution:**

```bash
# Copy template
cp Backend/.env.example Backend/.env

# Edit with your values
# nano Backend/.env (or use text editor)
```

---

### 🔴 Password Hashing Issues

#### Passwords not being hashed

**Cause:** Middleware not running

**Verify in Backend/models/User.js:**

```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

---

### 🔴 Token Issues

#### Token not persisting after refresh

**Cause:** Token not in localStorage

**Check in browser DevTools:**

1. Press F12
2. Go to Application tab
3. Check localStorage
4. Should see "token" entry

**If missing:**

```javascript
// Clear and try login again
localStorage.clear();
```

#### "Invalid token" error on GET /api/auth/me

**Cause:** Token format wrong or expired

**Solutions:**

1. Check token format: `Authorization: Bearer TOKEN_HERE`
2. Verify token not expired (check exp claim in JWT)
3. Use jwt.io to decode and verify token

---

### 🔴 Database Issues

#### Duplicate key error

**Cause:** Email already exists in database

**Solution:**

1. Use unique email for new signup
2. Or delete existing user:
   ```javascript
   db.users.deleteOne({ email: "existing@email.com" });
   ```

#### Database is empty

**Cause:** Different database selected or connection issue

**Solution:**

```javascript
// Verify in mongosh:
show dbs
use mern-chat
show collections
db.users.find()
```

---

### 🔴 Performance Issues

#### Backend slow to respond

**Solutions:**

1. Check MongoDB connection
2. Add indexes to database:
   ```javascript
   db.users.createIndex({ email: 1 });
   ```
3. Monitor server logs
4. Check system resources

#### Frontend slow/laggy

**Solutions:**

1. Check network tab in DevTools
2. Look for large assets
3. Check for memory leaks
4. Profile with React DevTools

---

## 🆘 Debug Steps

### For Any Error:

1. **Read the Error Message**

   - Usually tells you what's wrong
   - Check file and line number

2. **Check Browser Console** (F12)

   - Frontend errors here
   - Look for red errors

3. **Check Backend Terminal**

   - Backend errors printed here
   - Look for stack trace

4. **Check MongoDB**

   ```javascript
   mongosh
   use mern-chat
   db.users.find() // Check if data exists
   ```

5. **Check .env File**

   - Verify all values correct
   - No typos in keys

6. **Restart Everything**
   ```bash
   # 1. Kill all node processes
   # 2. Start backend again
   # 3. Start frontend again
   # 4. Try again
   ```

---

## 📝 Error Logging

### Add Error Logs to Backend

In `Backend/server.js`:

```javascript
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
```

---

## 🔍 Debugging Tools

### Use These Tools:

**Browser DevTools**

- F12 or Right-click → Inspect
- Console tab for errors
- Network tab for API calls
- Application tab for localStorage

**MongoDB Compass**

- Download: https://www.mongodb.com/products/tools/compass
- GUI for database exploration
- Easy to view/edit data

**Postman**

- Download: https://www.postman.com/
- Test API endpoints
- Check request/response

**VS Code Extensions**

- REST Client - Test APIs in VS Code
- MongoDB for VS Code - Manage database
- React DevTools - Debug React

---

## 🚨 Emergency Reset

### If Everything Breaks:

```bash
# 1. Kill all node processes
# Windows
taskkill /F /IM node.exe

# macOS/Linux
killall node

# 2. Clear everything
cd Backend && rm -r node_modules package-lock.json
cd ../frontend && rm -r node_modules package-lock.json

# 3. Reinstall
cd Backend && npm install
cd ../frontend && npm install

# 4. Start fresh
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# 5. Clear browser cache
# Browser → Settings → Clear Cache
# Or try Ctrl+Shift+Delete
```

---

## ❓ Still Stuck?

1. **Read the logs carefully** - Usually first error is the real one
2. **Google the error message** - Likely others had same issue
3. **Check Stack Overflow** - Search with error message
4. **Check GitHub Issues** - Look for reported problems
5. **Ask for help** - Discord, Reddit, Dev.to communities

---

**Common Quick Fixes:**

- [ ] Restart both servers
- [ ] Clear browser cache
- [ ] Check all .env variables
- [ ] Verify MongoDB running
- [ ] Check ports available
- [ ] npm install in both folders

Most issues resolve with one of these steps!
