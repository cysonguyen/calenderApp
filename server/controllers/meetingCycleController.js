const dayjs = require("dayjs");
const { Meeting, MeetingCycle, Schedule } = require("../models");
const { getMeetingCycles, replaceExistCycle } = require("../utils/object/schedule");
const { Op, or } = require("sequelize");
const MAX_SIZE_MONTH = 31;

module.exports = {
    async createMeetingCycle(schedule_id, start_time, end_time, cycle_index, transaction = null, company_id) {
        try {
            const existingMeetingCycle = await MeetingCycle.findOne({ where: { schedule_id, start_time, end_time, cycle_index, company_id } });
            if (existingMeetingCycle) {
                return existingMeetingCycle;
            }
            const meetingCycle = await MeetingCycle.create({ schedule_id, start_time, end_time, cycle_index, company_id }, { transaction });
            return meetingCycle;
        } catch (error) {
            throw error;
        }
    },

    async getMeetingCyclesByQuery(schedule_id, start_time = new Date(), end_time = new Date(), company_id) {
        try {
            const schedule = await Schedule.findByPk(schedule_id);
            if (!schedule) throw new Error("Schedule not found");

            const startTime = dayjs(start_time).toDate();
            const endTime = dayjs(end_time).toDate();

            const savedCycles = await MeetingCycle.findAll({
                include: [{
                    model: Meeting,
                    limit: MAX_SIZE_MONTH
                }],
                where: {
                    schedule_id,
                    company_id,
                    start_time: { [Op.between]: [startTime, endTime] }
                },
                order: [['start_time', 'ASC']],
                limit: MAX_SIZE_MONTH
            });

            const scheduleData = schedule.get({ plain: true });

            const generatedCycles = getMeetingCycles(
                scheduleData,
                startTime,
                endTime,
                MAX_SIZE_MONTH
            );

            const savedCyclePlain = savedCycles.map(c => c.get({ plain: true }));
            let mergedCycles = replaceExistCycle(savedCyclePlain, generatedCycles);

            mergedCycles = mergedCycles.map(cycle => ({
                ...cycle,
                id: cycle.cycle_index,
                original_id: cycle.id,
                schedule_id
            }));

            return mergedCycles;
        } catch (error) {
            console.error("getMeetingCyclesByQuery error:", error);
            throw error;
        }
    }
};
