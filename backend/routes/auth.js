const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Secret with fallback (same as auth middleware)
const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_change_in_production";

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  console.log("📝 Registration attempt:", {
    name,
    email: email?.toLowerCase(),
  });

  try {
    // 1. Check if fields are empty
    if (!name || !email || !password) {
      console.warn("⚠️ Registration failed: Missing fields");
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.warn("⚠️ Registration failed: User already exists", email);
      return res.status(400).json({ msg: "User already exists" });
    }

    // 3. Hash the password
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("✅ Password hashed successfully");

    // 4. Create new user
    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "candidate", // Default role
    });

    console.log("💾 Saving user to database...");
    await user.save();
    console.log("✅ User saved successfully:", user._id);

    // 5. Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // 6. Return JWT token
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) {
        console.error("❌ JWT Sign Error:", err.message);
        return res.status(500).json({ msg: "Error generating token" });
      }
      console.log("✅ Registration successful for:", email);
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    console.error("❌ Full error stack:", err.stack);
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if fields are empty
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // 2. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // 3. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 4. Create JWT Payload (Role add karna mat bhulna!)
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) {
        console.error("JWT Sign Error (Login):", err.message);
        return res.status(500).json({ msg: "Error generating token" });
      }
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
