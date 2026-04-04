const express = require("express");
const router = express.Router();
const {
  updateGrievanceStatus,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAdminNotifications,
  markNotificationRead,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes require admin authentication
router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.put("/grievances/:id", updateGrievanceStatus);
router.get("/notifications", getAdminNotifications);
router.put("/notifications/:id/read", markNotificationRead);

module.exports = router;
