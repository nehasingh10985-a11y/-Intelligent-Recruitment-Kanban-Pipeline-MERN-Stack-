const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT Check karne ke liye
const roleMiddleware = require("../middleware/roleMiddleware"); // Role check karne ke liye
const {
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/adminController"); // Admin controller functions

// Role-based access control setup
router.get(
  "/all-applications",
  auth,
  roleMiddleware("admin"),
  getAllApplications,
);

// @route   PUT /api/admin/update-status/:id
// @desc    Candidate ka status change karna (Hired/Rejected etc)
// @access  Private (Admin Only)
router.put(
  "/update-status/:id",
  auth,
  roleMiddleware("admin"),
  updateApplicationStatus,
);

// @route   DELETE /api/admin/delete/:id
// @desc    Kishi application ko delete karna
// @access  Private (Admin Only)
router.delete("/delete/:id", auth, roleMiddleware("admin"), deleteApplication);

module.exports = router;
