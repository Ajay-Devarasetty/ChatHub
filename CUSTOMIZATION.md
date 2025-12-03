# Customization Guide - MERN Chat Authentication

## 🎨 Customizing the Frontend

### Change Colors & Styling

Edit `frontend/src/styles/Auth.css` to customize:
```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* For example, use different colors: */
background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
/* or */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* or */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Customize Navbar

Edit `frontend/src/pages/Home.jsx`:
```jsx
<div className="navbar-brand">MERN Chat</div>
// Change to your app name
```

Edit `frontend/src/styles/Home.css` for navbar styling.

### Change Page Layout

Modify components in `frontend/src/pages/`:
- **Home.jsx** - Landing page content
- **Login.jsx** - Login form layout
- **Signup.jsx** - Signup form layout
- **Dashboard.jsx** - Dashboard content

## ⚙️ Customizing the Backend

### Add More User Fields

Edit `Backend/models/User.js`:
```javascript
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    
    // Add new fields here:
    phone: { type: String },
    avatar: { type: String },
    bio: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

### Customize JWT Expiration

Edit `Backend/.env`:
```
JWT_EXPIRE=7d      # Change to 30d, 1h, 24h, etc.
```

### Add Email Verification

In `Backend/controllers/authController.js`, add:
```javascript
// After user creation
const verificationToken = generateToken(user._id);
// Send email with verification link
// Save token to user.emailVerificationToken

// Add new route:
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOneAndUpdate(
    { emailVerificationToken: token },
    { isVerified: true, emailVerificationToken: null }
  );
  res.json({ success: true });
};
```

### Add Password Reset

Add to `Backend/models/User.js`:
```javascript
resetPasswordToken: String,
resetPasswordExpires: Date,
```

Then in controller:
```javascript
const resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) return res.status(400).json({ message: 'Invalid token' });
  
  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  
  res.json({ success: true });
};
```

## 🔄 Adding New Routes

### Add User Profile Route

1. Create controller method in `Backend/controllers/authController.js`:
```javascript
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, phone },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

2. Add to `Backend/routes/auth.js`:
```javascript
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
```

3. Use in Frontend `Dashboard.jsx`:
```jsx
const [user, setUser] = useState(null);

useEffect(() => {
  fetchUserProfile();
}, [token]);

const fetchUserProfile = async () => {
  const response = await fetch('http://localhost:5000/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  setUser(data.user);
};
```

## 📱 Mobile Optimization

Edit CSS files to add media queries:
```css
@media (max-width: 768px) {
  .auth-box {
    max-width: 90%;
    padding: 20px;
  }
  
  .navbar {
    flex-direction: column;
    padding: 15px;
  }
}
```

## 🎯 Adding Form Validation

Enhance `frontend/src/pages/Signup.jsx`:
```javascript
const [errors, setErrors] = useState({});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = {};
  
  if (!validateEmail(email)) {
    newErrors.email = 'Invalid email format';
  }
  
  if (password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  if (name.length < 2) {
    newErrors.name = 'Name must be at least 2 characters';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  // Proceed with signup
};
```

## 🔔 Add Notifications/Alerts

Install a notification library:
```bash
npm install react-toastify
```

Use in components:
```javascript
import { toast } from 'react-toastify';

const handleSuccess = () => {
  toast.success('Login successful!');
};

const handleError = (message) => {
  toast.error(message);
};
```

## 🗄️ Using MongoDB Atlas Instead of Local

1. Create free account at https://mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-chat?retryWrites=true&w=majority
```

## 🚀 Deployment Checklist

### Backend (Heroku)
1. Create `Procfile`:
```
web: node server.js
```

2. Update `package.json`:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

3. Deploy:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

## 🔐 Environment Variables for Production

**Backend `Backend/.env` (Production)**:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mern-chat
JWT_SECRET=generate_a_very_long_random_string_here_minimum_32_chars
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
```

**Frontend `frontend/.env.production`**:
```
VITE_API_URL=https://your-backend-url.com/api
```

Then use in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## 📊 Adding Database Indexing

In `Backend/models/User.js`:
```javascript
userSchema.index({ email: 1 });  // Faster email lookups
```

## 🧪 Testing

Add test file `Backend/routes/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});
```

## 🌐 Adding Social Login

Install package:
```bash
npm install @react-oauth/google
```

Add to `frontend/src/pages/Login.jsx`:
```javascript
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

<GoogleOAuthProvider clientId="your-google-client-id">
  <GoogleLogin
    onSuccess={(credentialResponse) => {
      // Handle Google login
      console.log(credentialResponse);
    }}
  />
</GoogleOAuthProvider>
```

---

**Tips for customization:**
- Always test changes locally before deploying
- Keep .env files secret - never commit to Git
- Use meaningful variable names
- Add comments to custom code
- Test all new features thoroughly
- Back up database before schema changes

Need help? Refer to the official docs:
- Express: https://expressjs.com/
- React: https://react.dev
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/
