// Job Model Controller - Handles Job CRUD operations
const Job = require("../models/Job");

// @desc    Create a new job (Admin only)
// @route   POST /api/jobs
// @access  Private (Admin)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      salary,
      description,
      skillsRequired,
    } = req.body;

    const job = new Job({
      adminId: req.user.id,
      title,
      company,
      location,
      jobType,
      salary,
      description,
      skillsRequired,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const { search, jobType, location } = req.query;
    let query = {};

    // Search by title or company
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by job type
    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if user is the job creator (admin)
    if (job.adminId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to update this job" });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if user is the job creator (admin)
    if (job.adminId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ msg: "Job removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Application Controller Functions (re-exported)
const Application = require("../models/Application");
const sendEmail = require("../utils/emailService");
const imagekit = require("../uploads/storage.service");

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

    const applications = await Application.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 2. Apply for Job (Optimized)
exports.applyForJob = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Please upload a resume" });
    }

    // 1. File ko ImageKit par upload karein
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // Buffer use karein (agar memoryStorage use kar rahe hain)
      fileName: `resume_${Date.now()}_${req.file.originalname}`,
      folder: "/resumes",
    });

    // Use findOneAndUpdate to reduce code lines (Atomic Operation)
    const updatedApp = await Application.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...req.body,
        resumeLink: uploadResponse.url,
        status: "Pending",
        date: Date.now(),
      },
      { new: true, upsert: true }, // upsert: true matlab nahi milega toh naya bana dega
    );

    // Email logic (Background)
    const subject = "Application Received - Veridia";
    const message = `<div style="font-family: sans-serif;"><h2>Hi ${req.body.fullName},</h2><p>We received your application for Software Engineer position.</p></div>`;

    sendEmail(req.body.email, subject, "", message).catch((err) =>
      console.error("Email failed:", err.message),
    );

    res.json(updatedApp);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ msg: "Cloud upload failed" });
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

// 5. Delete Application
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
