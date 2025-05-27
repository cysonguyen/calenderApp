const router = require("express").Router();
const { createJob, updateJob, deleteJob, getJobsByUserId, getJobByScheduleId } = require("../controllers/jobController");
const { authorizeValidUser } = require("../middleware/auth");
const { ROLES } = require("../utils/const");

router.post("/", authorizeValidUser(ROLES.LEADER), createJob);
router.put("/:job_id", authorizeValidUser(ROLES.LEADER), updateJob);
router.delete("/:job_id", authorizeValidUser(ROLES.LEADER), deleteJob);
router.get("/user/:user_id", getJobsByUserId);
router.get("/schedule/:schedule_id", getJobByScheduleId);

module.exports = router;
