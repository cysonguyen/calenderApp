const router = require("express").Router();
const accountController = require("../controllers/accountController");
const { authorizeValidUser } = require("../middleware/auth");
const { ROLES } = require("../utils/const");

router.get("/info/:id", authorizeValidUser(), accountController.getAccountInfo);
router.get("/info", authorizeValidUser(), accountController.getAccountInfoByQuery);
router.patch("/info/:id", authorizeValidUser(), accountController.updateAccountInfo);
router.put("/password/:id", authorizeValidUser(), accountController.changePassword);
router.get("/group/:id", authorizeValidUser(), accountController.getGroupById);
router.get("/groups/:id", authorizeValidUser(), accountController.getGroupByUserId);
router.get("/groups", authorizeValidUser(), accountController.getGroupByQuery);
router.post("/import", authorizeValidUser(ROLES.LEADER), accountController.importAccounts);
router.post("/staff", authorizeValidUser(ROLES.LEADER), accountController.createStaffUser);
router.post("/group", authorizeValidUser(ROLES.LEADER), accountController.createGroup);
router.put("/group/:id", authorizeValidUser(ROLES.LEADER), accountController.updateGroup);
router.delete("/group/:id", authorizeValidUser(ROLES.LEADER), accountController.deleteGroup);

module.exports = router;
