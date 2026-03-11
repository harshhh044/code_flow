const express = require("express");
const router = express.Router();
const {
  submitGrievance,
  getGrievances,
  getGrievanceById,
  getGrievanceByCode,
  deleteGrievance,
  addComment,
} = require("../controllers/grievanceController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.route("/")
  .post(submitGrievance)
  .get(getGrievances);

router.route("/:id")
  .get(getGrievanceById)
  .delete(deleteGrievance);

router.get("/code/:code", getGrievanceByCode);
router.post("/:id/comment", addComment);

module.exports = router;