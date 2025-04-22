const dayjs = require("dayjs");
const { User, Schedule } = require("../../models");
const { isOverlapTime } = require("../helper");

async function validateAvailabilitySchedule(start_time, end_time, userId) {
    const user = await User.findByPk(userId, {
        include: [{
            model: Schedule,
            through: { attributes: [] }
        }]
    });
    const usersData = user.get({ plain: true });
    const schedules = usersData.Schedules;
    const errors = [];
    for (const schedule of schedules) {
        if (isOverlapTime(start_time, end_time, schedule)) {
            errors.push("Schedule not available time");
        }
        break;
    }
    return errors;
}

function getMaxCycle(start_time, interval) {
    const maxCycle = 62;
    const maxTime = dayjs(start_time).add(maxCycle, interval).isBefore(dayjs(start_time).add(10, 'year'))
        ? dayjs(start_time).add(maxCycle, interval) : dayjs(start_time).add(10, 'year');
    return maxTime;
}
function getMeetingCycles(schedule, start_time_query = new Date(), end_time_query = new Date(), limit) {
    const { start_time, end_time, interval, intervalCount, is_repeat } = schedule;
    const meetingCycles = [];
    const maxTime = end_time_query ? dayjs(end_time_query) : getMaxCycle(start_time, interval);
    let currentCycle = 1;
    let startTime = dayjs(start_time);
    let endTime = dayjs(end_time);

    while (startTime.isBefore(maxTime) && meetingCycles.length < limit) {
        if (!start_time_query || startTime.isAfter(dayjs(start_time_query))) {
            meetingCycles.push({
                start_time: startTime.toDate().toISOString(),
                end_time: endTime.toDate().toISOString(),
                cycle_index: currentCycle,
            });
        }
        currentCycle++;
        startTime = startTime.add(intervalCount, interval);
        endTime = endTime.add(intervalCount, interval);
        if (!is_repeat) break;
    }
    return meetingCycles;
}

function replaceExistCycle(existCycle, cycles) {
    existCycle.forEach(cycle => {
        const index = cycles.findIndex(c => c.index === cycle.index);
        if (index !== -1) {
            cycles[index] = cycle;
        }
    });
    return cycles;
}

module.exports = {
    validateAvailabilitySchedule,
    getMeetingCycles,
    replaceExistCycle
};
