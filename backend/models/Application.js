const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    experience: {
      type: String,
      required: [true, "Experience level is required"],
    },
    resumeLink: {
      type: String,
      required: [true, "Resume link is required"],
    },
    fileId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Shortlisted"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Search optimization for name and email
ApplicationSchema.index({ fullName: "text", email: "text" });

module.exports = mongoose.model("Application", ApplicationSchema);
