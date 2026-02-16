const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      default: "Remote",
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time",
    },
    salary: {
      type: String, // String rakha hai taaki range (e.g., "5-8 LPA") likh sakein
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    skillsRequired: [String], // Array of skills for better filtering
  },
  {
    // YehCreatedAt aur updatedAt fields khud manage karega
    timestamps: true,
  },
);

// Search optimization: Job title aur company par index lagaya
JobSchema.index({ title: "text", company: "text" });

module.exports = mongoose.model("job", JobSchema);
