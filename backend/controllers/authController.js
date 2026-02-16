const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Helper function to generate Token (Code Repeat kam karne ke liye)
const generateToken = (user) => {
  const payload = {
    user: { id: user.id, role: user.role, name: user.name },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" });
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

    // 2. Hash Password (Mongoose Middleware use karna zyada clean hota hai, par yahan bhi theek hai)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "candidate",
    });

    await user.save();

    // 3. Generate and Return Token
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
    const user = await User.findOne({ email });
    // Error message generic rakhein (security ke liye)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
