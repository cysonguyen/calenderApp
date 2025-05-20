const router = require("express").Router();
const { createMeeting, updateMeeting, deleteMeeting, getMeetingById, getMeetingsByCycleId } = require("../controllers/meetingController");
const { authorizeValidUser } = require("../middleware/auth");
const { ROLES } = require("../utils/const");

router.post("/", authorizeValidUser(ROLES.LEADER), createMeeting);
router.put("/:meeting_id", authorizeValidUser(ROLES.LEADER), updateMeeting);
router.delete("/:meeting_id", authorizeValidUser(ROLES.LEADER), deleteMeeting);
router.get("/:meeting_id", getMeetingById);
router.get("/list/:cycle_id", getMeetingsByCycleId);

module.exports = router;
