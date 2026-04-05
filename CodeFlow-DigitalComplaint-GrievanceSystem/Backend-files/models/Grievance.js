const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    
    // Category & Priority
    category: {
      type: String,
      enum: [
        "academic",
        "hostel",
        "fees",
        "ragging",
        "library",
        "infrastructure",
        "canteen",
        "transportation",
        "medical",
        "sports",
        "administration",
        "other"
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "Low", "Normal", "High", "Critical", "normal", "critical"],
      default: "Normal",
    },
    
    // Status
    status: {
      type: String,
      enum: [
        "pending", "Pending",
        "processing", "Processing",
        "in-progress", "In Progress",
        "resolved", "Resolved",
        "rejected", "Rejected"
      ],
      default: "Pending",
    },
    prevStatus: {
      type: String,
    },
    
    // User Info
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    
    // Admin Response
    adminResponse: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    reviewComments: {
      type: String,
      default: "",
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewDate: {
      type: Date,
    },
    
    // Code/Tracking
    code: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Comments & History
    comments: [{
      text: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      isAdmin: Boolean,
      timestamp: { type: Date, default: Date.now },
    }],
    
    history: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }],
    
    // Timestamps
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate code before saving
grievanceSchema.pre("save", function (next) {
  if (!this.code) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = this.isAnonymous ? "ANON" : "GRV";
    this.code = `${prefix}-${year}-${random}`;
  }
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("Grievance", grievanceSchema);