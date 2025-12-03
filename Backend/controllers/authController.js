const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token (default expiry: 1 hour)
const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || "1h";
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    console.log("Signup request received:", { name, email });

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password before saving
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    const { avatar } = req.body;

    // Create user
    console.log("Creating user...");
    const user = await User.create({
      name,
      email,
      avatar: avatar || null,
      password: hashedPassword,
    });

    console.log("User created successfully:", user._id);

    // Get user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // For security and UX, we do NOT auto-issue a JWT on signup.
    // Require the user to explicitly login to receive a token.
    res.status(201).json({
      success: true,
      message: "Account created. Please login to continue.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error.message, error);
    res.status(500).json({ message: error.message || "Error creating user" });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create token
    const token = generateToken(user._id);

    // Get user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/me
// @desc    Update current logged in user (name, avatar)
// @access  Private
const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (typeof avatar !== "undefined") updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "-password",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in updateMe:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe, updateMe };
