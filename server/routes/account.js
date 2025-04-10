const router = require("express").Router();
const accountController = require("../controllers/accountController");
const { authorizeValidUser } = require("../middleware/auth");
const { ROLES } = require("../utils/const");

router.get("/info/:id", accountController.getAccountInfo);
router.get("/info", accountController.getAccountInfoByQuery);
router.patch("/info/:id", accountController.updateAccountInfo);
router.put("/password/:id", accountController.changePassword);
router.get("/group/:id", accountController.getGroupById);
router.get("/groups/:id", accountController.getGroupByUserId);
router.get("/groups", accountController.getGroupByQuery);
router.post("/import", authorizeValidUser(ROLES.TEACHER), accountController.importAccounts);
router.post("/student", authorizeValidUser(ROLES.TEACHER), accountController.createStudentUser);
router.post("/group", authorizeValidUser(ROLES.TEACHER), accountController.createGroup);
router.put("/group/:id", authorizeValidUser(ROLES.TEACHER), accountController.updateGroup);
router.delete("/group/:id", authorizeValidUser(ROLES.TEACHER), accountController.deleteGroup);

module.exports = router;
