const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @route  PUT /api/admin/grievances/:id
// @access Admin only
const updateGrievanceStatus = async (req, res) => {
  const { status, adminResponse, adminNotes, reviewComments, priority } = req.body;

  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Store previous status
    grievance.prevStatus = grievance.status;

    // Update fields
    if (status) grievance.status = status;
    if (adminResponse) grievance.adminResponse = adminResponse;
    if (adminNotes) grievance.adminNotes = adminNotes;
    if (reviewComments) grievance.reviewComments = reviewComments;
    if (priority) grievance.priority = priority;
    
    grievance.handledBy = req.user._id;
    grievance.reviewDate = new Date();
    grievance.lastUpdated = Date.now();

    // Add to history
    grievance.history.push({
      status: status || grievance.status,
      timestamp: new Date(),
      note: adminNotes || adminResponse || `Status updated to ${status}`,
      changedBy: req.user._id,
    });

    await grievance.save();

    // Create notification for student
    await Notification.create({
      userId: grievance.submittedBy,
      title: "Grievance Status Updated",
      message: `Your grievance "${grievance.title}" status: ${status}`,
      type: "status_update",
      grievanceId: grievance._id,
      grievanceCode: grievance.code,
    });

    // Populate before sending response
    await grievance.populate("submittedBy", "name email department");
    await grievance.populate("handledBy", "name email");

    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/admin/stats
// @access Admin only
const getDashboardStats = async (req, res) => {
  try {
    const total = await Grievance.countDocuments();
    const pending = await Grievance.countDocuments({ 
      status: { $in: ["pending", "Pending"] } 
    });
    const inProgress = await Grievance.countDocuments({ 
      status: { $in: ["in-progress", "In Progress"] } 
    });
    const resolved = await Grievance.countDocuments({ 
      status: { $in: ["resolved", "Resolved"] } 
    });
    const rejected = await Grievance.countDocuments({ 
      status: { $in: ["rejected", "Rejected"] } 
    });
    const anonymous = await Grievance.countDocuments({ isAnonymous: true });
    const totalUsers = await User.countDocuments({ role: "student" });

    // Category breakdown
    const byCategory = await Grievance.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Monthly breakdown
    const byMonth = await Grievance.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [
                { $in: ["$status", ["resolved", "Resolved"]] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      anonymous,
      totalUsers,
      byCategory,
      byMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/admin/users
// @access Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    // Add grievance count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const grievanceCount = await Grievance.countDocuments({
          submittedBy: user._id,
        });
        return {
          ...user.toObject(),
          grievanceCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/admin/users/:id/status
// @access Admin only
const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;
    await user.save();

    res.json({ message: "User status updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/admin/notifications
// @access Admin only
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/admin/notifications/:id/read
// @access Admin only
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateGrievanceStatus,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAdminNotifications,
  markNotificationRead,
};
