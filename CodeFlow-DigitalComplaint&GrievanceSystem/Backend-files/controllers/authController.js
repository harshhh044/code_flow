const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register new user
const register = async (req, res) => {
  try {
    console.log("[REGISTER] Request body:", req.body);

    const {
      name,
      fullName,
      email,
      uniEmail,
      personalEmail,
      password,
      role,
      department,
      dept,
      rollNumber,
      rollNo,
      studentId,
      uid,
      phone,
    } = req.body;

    // Use whichever email field is provided
    const userEmail = email || uniEmail || personalEmail;

    if (!userEmail) {
      console.error("[REGISTER] No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      console.error("[REGISTER] No password provided");
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userEmail },
        { uniEmail: userEmail },
        { personalEmail: userEmail },
      ],
    });

    if (existingUser) {
      console.error("[REGISTER] User already exists:", userEmail);
      return res.status(400).json({ 
        message: "User with this email already registered" 
      });
    }

    // Create user
    const user = await User.create({
      name: name || fullName,
      fullName: fullName || name,
      email: userEmail,
      uniEmail: uniEmail || userEmail,
      personalEmail: personalEmail || userEmail,
      password, // Will be hashed by the model
      role: role || "student",
      department: department || dept,
      dept: dept || department,
      rollNumber: rollNumber || rollNo || studentId || uid,
      rollNo: rollNo || rollNumber || studentId || uid,
      studentId: studentId || rollNumber || rollNo || uid,
      uid: uid || studentId || rollNumber || rollNo,
      phone,
      status: "active",
    });

    console.log("[REGISTER] User created successfully:", user._id);

    // Generate token
    const token = generateToken(user._id);

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      uniEmail: user.uniEmail,
      personalEmail: user.personalEmail,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      studentId: user.studentId,
      uid: user.uid,
      phone: user.phone,
      status: user.status,
      token,
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    console.log("[LOGIN] Request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.error("[LOGIN] Missing email or password");
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Find user by any email field
    const user = await User.findOne({
      $or: [
        { email },
        { uniEmail: email },
        { personalEmail: email },
      ],
    }).select("+password");

    if (!user) {
      console.error("[LOGIN] User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] User found:", user._id);

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      console.error("[LOGIN] Password mismatch for user:", user._id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] Password matched, login successful");

    // Generate token
    const token = generateToken(user._id);

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      uniEmail: user.uniEmail,
      personalEmail: user.personalEmail,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      rollNo: user.rollNo,
      studentId: user.studentId,
      uid: user.uid,
      phone: user.phone,
      status: user.status,
      token,
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    console.log("[GET_ME] User ID from token:", req.user._id);

    const user = await User.findById(req.user._id);

    if (!user) {
      console.error("[GET_ME] User not found");
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      uniEmail: user.uniEmail,
      personalEmail: user.personalEmail,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      studentId: user.studentId,
      uid: user.uid,
      phone: user.phone,
      status: user.status,
    });
  } catch (error) {
    console.error("[GET_ME] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};