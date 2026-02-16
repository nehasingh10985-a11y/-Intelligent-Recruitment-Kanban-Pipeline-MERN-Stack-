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
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Shortlisted"], // Roles fix kar diye
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 👈 Yeh 'User' model se link hona chahiye
      required: true,
    },
  },
  {
    // Auto-create createdAt and updatedAt
    timestamps: true,
  },
);

// Search optimization ke liye indexing (Technical Flex)
ApplicationSchema.index({ fullName: "text", email: "text" });

module.exports = mongoose.model("Application", ApplicationSchema);
