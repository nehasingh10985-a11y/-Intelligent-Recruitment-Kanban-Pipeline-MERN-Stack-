const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT Check karne ke liye
const Application = require("../models/Application"); // Application Schema
const sendEmail = require("../utils/emailService"); // Nodemailer helper

// @route   GET /api/admin/all-applications
// @desc    Saare candidates ki list fetch karna
// @access  Private (Admin Only)
router.get("/all-applications", auth, async (req, res) => {
  try {
    // Check karein ki user admin hai ya nahi
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Authorization denied. Admin only." });
    }

    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/admin/update-status/:id
// @desc    Candidate ka status change karna (Hired/Rejected etc)
// @access  Private (Admin Only)
router.put("/update-status/:id", auth, async (req, res) => {
  const { status } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    let application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ msg: "Application not found" });

    application.status = status;
    await application.save();

    // ✅ Nodemailer: Automatic Email bhejna jab status badle
    await sendEmail(application.email, `Application Update: ${status}`, status);

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/admin/delete/:id
// @desc    Kishi application ko delete karna
// @access  Private (Admin Only)
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ msg: "Application removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
