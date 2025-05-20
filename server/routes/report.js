const router = require("express").Router();
const { createReport, updateReport, deleteReport, getReportById, getReportsByMeetingId } = require("../controllers/reportController");
const { authorizeValidUser } = require("../middleware/auth");
const { ROLES } = require("../utils/const");

router.post("/", authorizeValidUser(ROLES.LEADER), createReport);
router.put("/:report_id", authorizeValidUser(ROLES.LEADER), updateReport);
router.delete("/:report_id", authorizeValidUser(ROLES.LEADER), deleteReport);
router.get("/:report_id", getReportById);
router.get("/list/:meeting_id", getReportsByMeetingId);

module.exports = router;
