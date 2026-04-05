const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["status_update", "new_response", "new_grievance", "general"],
      default: "general",
    },
    grievanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
      default: null,
    },
    grievanceCode: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);