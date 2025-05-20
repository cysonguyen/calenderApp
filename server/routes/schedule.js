const router = require('express').Router()
const scheduleController = require('../controllers/scheduleController')
const { authorizeValidUser } = require('../middleware/auth')
const { ROLES } = require('../utils/const')

router.get('/list/:userId', scheduleController.getSchedulesByUserId)
router.get('/:scheduleId', scheduleController.getScheduleById)
router.post('/:authorUserId', authorizeValidUser(ROLES.LEADER), scheduleController.createSchedule)
router.put('/:authorUserId', authorizeValidUser(ROLES.LEADER), scheduleController.updateSchedule)
router.delete('/:scheduleId', authorizeValidUser(ROLES.LEADER), scheduleController.deleteSchedule)
router.put('/accept/:scheduleId', scheduleController.acceptSchedule)

module.exports = router

