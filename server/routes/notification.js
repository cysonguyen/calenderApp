const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken } = require("../middleware/auth");

router.get("/:user_id", authenticateToken, notificationController.getAllNotification);
router.put("/:notification_id", authenticateToken, notificationController.updateNotification);

module.exports = router;


