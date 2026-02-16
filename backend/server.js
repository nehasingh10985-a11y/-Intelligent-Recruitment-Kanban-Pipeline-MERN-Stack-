require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();

// 1. Database Connection
connectDB();

// 2. Base Middlewares
// Body parser for JSON
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token", "Accept"],
  }),
);

// 3. DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log(`--- New Request ---`);
  console.log(`Method: ${req.method} | URL: ${req.url}`);
  console.log("Body Data:", req.body);
  console.log("Header Received:", req.header("Authorization"));
  next();
});

// 4. Serve Static Files (Resume Uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. Routes Registration
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/admin", require("./routes/admin"));

// Root Health Check
app.get("/", (req, res) => res.send("API is running..."));

// 6. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err.stack);

  // Multer Specific Errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ msg: "File too large. Max 5MB." });
    }
    return res.status(400).json({ msg: err.message });
  }

  // General Server Errors
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    msg: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 7. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Admin Route: http://localhost:${PORT}/api/admin`);
  console.log(`Auth Route: http://localhost:${PORT}/api/auth`);
});
