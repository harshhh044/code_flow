const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Notification = require("../models/Notification");

// =========================
// SUBMIT GRIEVANCE
// =========================
const submitGrievance = async (req, res) => {
  try {
    const { title, subject, description, category, priority, isAnonymous } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const year = new Date().getFullYear();
    const code = isAnonymous
      ? `ANON-${year}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : `GRV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const grievance = await Grievance.create({
      title: title || subject,
      subject: subject || title,
      description,
      category,
      priority: priority || "medium",
      status: "pending",
      submittedBy: userId,
      isAnonymous: isAnonymous || false,
      code,
    });

    await grievance.populate("submittedBy", "name email rollNumber");

    // Send notifications to admins
    try {
      const admins = await User.find({ role: "admin" });
      if (admins.length > 0) {
        const notifications = admins.map((admin) => ({
          userId: admin._id,
          title: "New Grievance Submitted",
          message: isAnonymous
            ? `Anonymous grievance submitted`
            : `New grievance from ${req.user.name}`,
          type: "new_grievance",
          grievanceId: grievance._id,
          grievanceCode: code,
        }));
        await Notification.insertMany(notifications);
      }
    } catch (err) {
      console.error("Notification error:", err);
    }

    res.status(201).json(grievance);
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================
// GET GRIEVANCES
// =========================
const getGrievances = async (req, res) => {
  try {
    console.log("User:", req.user);

    // Admin sees all, student sees only their own
    const query = req.user.role === "admin" ? {} : { submittedBy: req.user._id };

    const grievances = await Grievance.find(query)
      .populate("submittedBy", "name email rollNumber")
      .populate("handledBy", "name email")
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    console.error("Get Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================
// GET BY ID
// =========================
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("submittedBy", "name email rollNumber")
      .populate("handledBy", "name email")
      .populate("comments.userId", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(grievance);
  } catch (error) {
    console.error("Get by ID Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================
// GET BY CODE
// =========================
const getGrievanceByCode = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ code: req.params.code })
      .populate("submittedBy", "name email rollNumber")
      .populate("handledBy", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Only allow owner or admin to view
    if (
      req.user.role !== "admin" &&
      !grievance.isAnonymous &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(grievance);
  } catch (error) {
    console.error("Get by Code Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================
// DELETE
// =========================
const deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await grievance.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================
// ADD COMMENT
// =========================
const addComment = async (req, res) => {
  try {
    const { comment, text } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    grievance.comments.push({
      userId: req.user._id,
      text: comment || text,
      timestamp: new Date(),
    });

    await grievance.save();
    res.json(grievance);
  } catch (error) {
    console.error("Comment Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitGrievance,
  getGrievances,
  getGrievanceById,
  getGrievanceByCode,
  deleteGrievance,
  addComment,
};
