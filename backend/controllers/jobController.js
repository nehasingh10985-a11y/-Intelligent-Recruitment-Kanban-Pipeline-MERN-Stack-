const Application = require("../models/Application");
const sendEmail = require("../utils/emailService");

// 1. Get All Applications (With Advanced Filtering & Search)
exports.getAllApplications = async (req, res) => {
  try {
    const { search, status, experience } = req.query;
    let query = {};

    // 🔍 Multi-field Search (Name or Email) using Regex
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter by Status
    if (status && status !== "All") {
      query.status = status;
    }

    // 📈 Filter by Experience (e.g., '2+' years)
    if (experience) {
      query.experience = { $regex: experience, $options: "i" };
    }

    const applications = await Application.find(query).sort({ date: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 2. Apply for Job (Optimized)
exports.applyForJob = async (req, res) => {
  try {
    // Dynamic Resume Link Logic
    const resumeLink = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : req.body.resumeLink;

    // Use findOneAndUpdate to reduce code lines (Atomic Operation)
    const updatedApp = await Application.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, resumeLink, status: "Pending", date: Date.now() },
      { new: true, upsert: true }, // upsert: true matlab nahi milega toh naya bana dega
    );

    // Email logic (Background)
    const subject = "Application Received - Veridia";
    const message = `<div style="font-family: sans-serif;"><h2>Hi ${req.body.fullName},</h2><p>We received your application for Software Engineer position.</p></div>`;

    sendEmail(req.body.email, subject, "", message).catch((err) =>
      console.error("Email failed:", err.message),
    );

    res.json(updatedApp);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// 3. Get My Application
exports.getMyApplication = async (req, res) => {
  try {
    const app = await Application.findOne({ userId: req.user.id });
    if (!app) return res.status(404).json({ msg: "No application found" });
    res.json(app);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// 4. Update Status (For Drag & Drop / Buttons)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!application) return res.status(404).json({ msg: "App not found" });
    res.json(application);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// controllers/jobController.js mein ye add karein:

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
