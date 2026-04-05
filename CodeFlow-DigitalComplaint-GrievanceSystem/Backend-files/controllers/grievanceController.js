const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Notification = require("../models/Notification");

// =========================
// SUBMIT GRIEVANCE
// =========================
const submitGrievance = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      category,
      priority,
      isAnonymous,
    } = req.body;

    // 🔥 Ensure user exists (for logged-in)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = req.user._id;

    // Generate tracking code
    const year = new Date().getFullYear();
    const code = isAnonymous
      ? `ANON-${year}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : `GRV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 🔥 IMPORTANT: Always store userId (even if anonymous)
    const grievance = await Grievance.create({
      title: title || subject,
      subject: subject || title,
      description,
      category,
      priority: priority || "medium",
      status: "pending",
      submittedBy: userId, // ✅ ALWAYS store user
      isAnonymous: isAnonymous || false,
      code,
    });

    // Populate user if needed
    await grievance.populate("submittedBy", "name email rollNumber");

    // Create notifications (optional)
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

    let grievances;

    if (req.user.role === "admin") {
      // Admin → see all
      grievances = await Grievance.find({});
    } else {
      // User → see their own
      grievances = await Grievance.find({
        submittedBy: req.user._id,
      });
    }

    grievances = await Grievance.find(grievances)
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
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// GET BY CODE
// =========================
const getGrievanceByCode = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ code: req.params.code });

    if (!grievance) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(grievance);
  } catch (error) {
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
      return res.status(404).json({ message: "Not found" });
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
    res.status(500).json({ message: error.message });
  }
};

// =========================
// ADD COMMENT
// =========================
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Not found" });
    }

    grievance.comments.push({
      userId: req.user._id,
      text: comment,
      timestamp: new Date(),
    });

    await grievance.save();

    res.json(grievance);
  } catch (error) {
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
