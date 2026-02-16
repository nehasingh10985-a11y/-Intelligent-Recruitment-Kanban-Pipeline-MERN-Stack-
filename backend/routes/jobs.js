// ✅ Correct (backend/routes/jobs.js)
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Application = require("../models/Application");

const {
  applyForJob,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/jobController");

// Get All Applications (for Admin)
router.get("/all-applications", auth, getAllApplications);

// Yahan sirf "/my-application" aayega
router.get("/my-application", auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user.id });
    if (!application) {
      return res.status(404).json({ msg: "No application found" });
    }
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Apply for Job - with file upload middleware
router.post("/apply", auth, upload.single("resume"), applyForJob);

// Update Application Status (for Kanban drag & drop)
router.put("/update-status/:id", auth, updateApplicationStatus);

// Delete Application
router.delete("/delete/:id", auth, deleteApplication);

module.exports = router;
