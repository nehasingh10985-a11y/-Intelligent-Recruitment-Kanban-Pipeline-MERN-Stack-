const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// JWT Secret with fallback
const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_change_in_production";

// Helper function to generate Token
const generateToken = (user) => {
  const payload = {
    user: { id: user.id, role: user.role, name: user.name },
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" });
};

// @desc    Register a user
exports.register = async (req, res) => {
  // 1. Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Let Mongoose pre-save middleware handle password hashing
    user = new User({
      name,
      email,
      password,
      role: role || "candidate",
    });

    await user.save();

    // Generate and Return Token
    const token = generateToken(user);
    res
      .status(201)
      .json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  // 1. Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    console.log("🔐 Login Attempt:");
    console.log("  Email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("  ❌ User not found");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    console.log("  👤 User found:", user.email);
    console.log(
      "  🔒 Stored password hash:",
      user.password.substring(0, 20) + "...",
    );

    // Debug: Check if password is hashed (starts with $2a$, $2b$, etc.)
    const isPasswordHashed =
      user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
    console.log("  ✅ Password is hashed:", isPasswordHashed);

    if (!isPasswordHashed) {
      console.log("  ❌ ERROR: Password is not hashed! This is a bug.");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("  🔑 Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).send("Server error");
  }
};
