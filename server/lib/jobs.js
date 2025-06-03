const cron = require('node-cron');
const dayjs = require('dayjs');
const { Schedule, MeetingCycle } = require('../models');
const { getMeetingCycles } = require('../utils/object/schedule');
const { createMeetingCycle } = require('../controllers/meetingCycleController');

const BATCH_SIZE = 100;
const CYCLE_LIMIT_PER_SCHEDULE = 10;

async function processSchedules(offset = 0, nextRun = false) {
    const tomorrow = dayjs().add(2, 'day').startOf('day');
    const start_time = tomorrow.subtract(30, 'day').toDate();
    const end_time = tomorrow.endOf('day').toDate();

    const { count, rows: schedules } = await Schedule.findAndCountAll({
        offset,
        limit: BATCH_SIZE,
    });

    console.log(`[CRON] Processing schedules ${offset + 1} to ${offset + schedules.length}`);

    for (const schedule of schedules) {
        const scheduleData = schedule.get({ plain: true });
        const company_id = schedule.company_id;
        const cycles = getMeetingCycles(scheduleData, start_time, end_time, CYCLE_LIMIT_PER_SCHEDULE);
        for (const cycle of cycles) {
            const exists = await MeetingCycle.findOne({
                where: {
                    schedule_id: schedule.id,
                    cycle_index: cycle.cycle_index,
                },
            });

            if (!exists) {
                console.log("create cycle", cycle);
                await createMeetingCycle(schedule.id, cycle.start_time, cycle.end_time, cycle.cycle_index, company_id);
                console.log(`Created cycle for schedule ${schedule.id}`);
            }
        }
    }

    if (offset + BATCH_SIZE < count && !nextRun) {
        console.log(`[CRON] More schedules left. Scheduling next run in 3 hours...`);

        const job = cron.schedule(new Date(Date.now() + 3 * 60 * 60 * 1000), () => {
            processSchedules(offset + BATCH_SIZE, true);
            job.stop();
        });
    }
}

cron.schedule('0 1 * * *', () => {
    console.log('🔁 Running schedule generator at 9:00 AM');
    processSchedules(0);
});

