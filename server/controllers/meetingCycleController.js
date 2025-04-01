const { Meeting, MeetingCycle, Schedule } = require("../models");
const { getMeetingCycles, replaceExistCycle } = require("../utils/object/schedule");
const { Op } = require("sequelize");
const pageSize = 10;

module.exports = {
    async createMeetingCycle(schedule_id, start_time, end_time, cycle_index, transaction = null) {
        try {
            const existingMeetingCycle = await MeetingCycle.findOne({ where: { schedule_id, start_time, end_time, cycle_index } });
            if (existingMeetingCycle) {
                throw new Error("Meeting cycle already exists");
            }
            const meetingCycle = await MeetingCycle.create({ schedule_id, start_time, end_time, cycle_index }, { transaction });
            return meetingCycle;
        } catch (error) {
            throw error;
        }
    },

    async getMeetingCyclesByQuery(schedule_id, start_time = new Date(), end_time = new Date('2099-12-31')) {
        try {
            const schedule = await Schedule.findByPk(schedule_id);
            if (!schedule) {
                throw new Error("Schedule not found");
            }
            let meetingCycles = [];
            meetingCycles = await MeetingCycle.findAll({
                include: [{
                    model: Meeting,
                    limit: pageSize
                }],
                where: { schedule_id, start_time: { [Op.between]: [start_time, end_time] } }, order: [['start_time', 'ASC']],
                limit: pageSize
            });

            const latestCycle = meetingCycles[0];
            const scheduleData = schedule.get({ plain: true });
            const { start_time: latestCycleStartTime, end_time: latestCycleEndTime } = latestCycle || scheduleData;
            const futureSchedule = {
                ...scheduleData,
                start_time: latestCycleStartTime,
                end_time: latestCycleEndTime,
            }
            const cyclesInFuture = getMeetingCycles(futureSchedule, start_time, end_time, pageSize - meetingCycles.length);
            const { cycle_edited } = schedule;
            const cycleIdsEdited = JSON.parse(cycle_edited || "[]");
            meetingCycles = [...meetingCycles, ...cyclesInFuture];
            if (Array.isArray(cycleIdsEdited) && cycleIdsEdited.length > 0) {
                const existCycle = await MeetingCycle.findAll({
                    where: { schedule_id, start_time: { [Op.gte]: start_time }, id: { [Op.in]: cycleIdsEdited } },
                    limit: pageSize
                });
                meetingCycles = replaceExistCycle(existCycle, meetingCycles);
            }
            return meetingCycles;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
};
