const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Submit a new grievance
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

    console.log("[submitGrievance] Request body:", req.body);
    console.log("[submitGrievance] User from token:", req.user);

    // ✅ FIX: Better user checking
    let submittedBy = null;
    
    if (!isAnonymous) {
      // For non-anonymous, user MUST be logged in
      if (!req.user || !req.user._id) {
        console.error("[submitGrievance] User not found in request");
        return res.status(401).json({ 
          message: "User not found. Please login again." 
        });
      }
      submittedBy = req.user._id;
      console.log("[submitGrievance] Submitted by user ID:", submittedBy);
    } else {
      console.log("[submitGrievance] Anonymous submission");
    }

    // Generate tracking code
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = isAnonymous 
      ? `ANON-${year}-${randomPart}` 
      : `GRV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log("[submitGrievance] Generated code:", code);

    // Create grievance
    const grievance = await Grievance.create({
      title: title || subject,
      subject: subject || title,
      description,
      category,
      priority: priority || "medium",
      status: "pending",
      submittedBy: isAnonymous ? null : submittedBy,
      isAnonymous,
      code,
    });

    console.log("[submitGrievance] Grievance created:", grievance._id);

    // Populate user details if not anonymous
    if (!isAnonymous && submittedBy) {
      await grievance.populate("submittedBy", "name email rollNumber");
    }

    // Create notification for admins
    try {
      const admins = await User.find({ role: "admin" });
      console.log("[submitGrievance] Found admins:", admins.length);
      
      if (admins.length > 0) {
        const notifications = admins.map(admin => ({
          userId: admin._id,
          title: "New Grievance Submitted",
          message: isAnonymous 
            ? `Anonymous grievance: ${title || subject}`
            : `New grievance from ${req.user?.name || 'Unknown'}: ${title || subject}`,
          type: "new_grievance",
          grievanceId: grievance._id,
          grievanceCode: code,
          url: `/admin/grievances/${grievance._id}`,
        }));
        
        await Notification.insertMany(notifications);
        console.log("[submitGrievance] Notifications created");
      }
    } catch (notifError) {
      console.error("[submitGrievance] Notification error (non-critical):", notifError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json(grievance);
  } catch (error) {
    console.error("[submitGrievance] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get grievances (user sees their own, admin sees all)
const getGrievances = async (req, res) => {
  try {
    console.log("[getGrievances] User:", req.user);

    let query = {};

    // If user is not admin, only show their grievances
    if (req.user.role !== "admin") {
      query.submittedBy = req.user._id;
    }

    const grievances = await Grievance.find(query)
      .populate("submittedBy", "name email rollNumber")
      .populate("handledBy", "name email")
      .sort({ createdAt: -1 });

    console.log("[getGrievances] Found grievances:", grievances.length);

    res.json(grievances);
  } catch (error) {
    console.error("[getGrievances] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single grievance by ID
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("submittedBy", "name email rollNumber department")
      .populate("handledBy", "name email")
      .populate("comments.userId", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Authorization check: students can only view their own
    if (
      req.user.role !== "admin" &&
      grievance.submittedBy &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(grievance);
  } catch (error) {
    console.error("[getGrievanceById] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get grievance by code
const getGrievanceByCode = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ code: req.params.code })
      .populate("submittedBy", "name email rollNumber")
      .populate("handledBy", "name email")
      .populate("comments.userId", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // For anonymous grievances, anyone with the code can view
    // For non-anonymous, only the submitter or admin can view
    if (
      !grievance.isAnonymous &&
      req.user.role !== "admin" &&
      grievance.submittedBy &&
      grievance.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(grievance);
  } catch (error) {
    console.error("[getGrievanceByCode] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete grievance (only if pending and user is owner)
const deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only allow deletion if status is pending
    if (grievance.status !== "pending") {
      return res.status(400).json({ 
        message: "Can only delete pending grievances" 
      });
    }

    await grievance.deleteOne();

    res.json({ message: "Grievance deleted successfully" });
  } catch (error) {
    console.error("[deleteGrievance] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add comment to grievance
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Add comment
    grievance.comments.push({
      userId: req.user._id,
      text: comment,
      timestamp: new Date(),
    });

    await grievance.save();

    // Populate the comments
    await grievance.populate("comments.userId", "name email");

    res.json(grievance);
  } catch (error) {
    console.error("[addComment] Error:", error);
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
