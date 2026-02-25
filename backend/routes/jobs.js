// Jobs routes - includes both Job CRUD and Application management
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const Application = require("../models/Application");

// Import all job controller functions
const {
  // Job CRUD operations
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  // Application operations
  applyForJob,
  getAllApplications,
  getMyApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/jobController");

// ==================== Application Routes ====================
// IMPORTANT: These must be defined BEFORE parameterized routes like /:id

// Get All Applications (Admin only)
router.get(
  "/all-applications",
  auth,
  roleMiddleware("admin"),
  getAllApplications,
);

// Get my application (Candidate)
router.get("/my-application", auth, getMyApplication);

// Apply for Job - with file upload middleware
router.post("/apply", auth, upload.single("resume"), applyForJob);

// Update Application Status (Admin only - for Kanban drag & drop)
router.put(
  "/update-status/:id",
  auth,
  roleMiddleware("admin"),
  updateApplicationStatus,
);

// Delete Application (Admin only)
router.delete("/delete/:id", auth, roleMiddleware("admin"), deleteApplication);

// ==================== Job Routes ====================

// Get all jobs (Public)
router.get("/", getAllJobs);

// Create a job (Admin only)
router.post("/", auth, roleMiddleware("admin"), createJob);

// Update a job (Admin only)
router.put("/:id", auth, roleMiddleware("admin"), updateJob);

// Delete a job (Admin only)
router.delete("/:id", auth, roleMiddleware("admin"), deleteJob);

// Get single job by ID (Public) - MUST be last
router.get("/:id", getJobById);

module.exports = router;
