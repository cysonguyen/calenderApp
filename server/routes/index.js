const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const accountRoutes = require("./account");
const scheduleRoutes = require("./schedule");
const meetingRoutes = require("./meeting");
const notificationRoutes = require("./notification");
const clientEventRoutes = require("./client-event");
const { authenticateToken } = require("../middleware/auth");

router.use("/auth", authRoutes);
router.use("/account", authenticateToken, accountRoutes);
router.use("/schedule", authenticateToken, scheduleRoutes);
router.use("/meeting", authenticateToken, meetingRoutes);
router.use("/client-event", clientEventRoutes);
router.use("/notification", authenticateToken, notificationRoutes);

module.exports = router;
