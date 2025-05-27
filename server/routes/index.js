const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const accountRoutes = require("./account");
const scheduleRoutes = require("./schedule");
const meetingRoutes = require("./meeting");
const notificationRoutes = require("./notification");
const clientEventRoutes = require("./client-event");
const reportRoutes = require("./report");
const { authenticateToken } = require("../middleware/auth");
const jobRoutes = require("./job");

router.use("/auth", authRoutes);
router.use("/account", authenticateToken, accountRoutes);
router.use("/schedule", authenticateToken, scheduleRoutes);
router.use("/meeting", authenticateToken, meetingRoutes);
router.use("/client-event", clientEventRoutes);
router.use("/notification", authenticateToken, notificationRoutes);
router.use("/report", authenticateToken, reportRoutes);
router.use("/job", authenticateToken, jobRoutes);

module.exports = router;
