const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const { Meeting, MeetingCycle, Schedule, Notification } = require("../models");
const { removeNullOrUndefined, compareIdsArray } = require("../utils/helper");
const { validateAvailabilityMeeting } = require("../utils/object/meeting");
const { createMeetingCycle } = require("./meetingCycleController");

const createMeeting = async (req, res) => {
    try {
        const { schedule_id, meeting_cycle_id, title, description, start_time, end_time, list_partner_ids, cycle_index } = req.body;
        if (!schedule_id) {
            return res.status(400).json({ error: ["Schedule ID is required"] });
        }
        const schedule = await Schedule.findByPk(schedule_id);
        if (!schedule) {
            return res.status(400).json({ error: ["Schedule not found"] });
        }
        if (!title || !start_time || !end_time || !list_partner_ids || !cycle_index) {
            return res.status(400).json({ error: ["Missing required fields"] });
        }
        if (!Array.isArray(list_partner_ids) || list_partner_ids.length === 0) {
            return res.status(400).json({ error: ["List partner IDs is required"] });
        }

        let meeting;
        await sequelize.transaction(async (transaction) => {
            let meetingCycle;
            if (!meeting_cycle_id) {
                meetingCycle = await createMeetingCycle(schedule_id, schedule.start_time, schedule.end_time, cycle_index, transaction);
            } else {
                meetingCycle = await MeetingCycle.findByPk(meeting_cycle_id, { transaction });
                if (!meetingCycle) {
                    return res.status(400).json({ error: ["Meeting cycle not found"] });
                }
            }
            const error = await validateAvailabilityMeeting(start_time, end_time, meetingCycle.id, title);
            if (error.length > 0) {
                throw new Error(error.join(", "));
            }

            meeting = await Meeting.create({
                meeting_cycle_id: meetingCycle.id,
                title,
                description,
                start_time,
                end_time,
                list_partner_ids: JSON.stringify(list_partner_ids),
            }, { transaction });
            const scheduleData = schedule.get({ plain: true });
            const newEditedSchedule = JSON.stringify([...JSON.parse(scheduleData.cycle_edited ?? "[]"), meetingCycle.id]);
            await Schedule.update({
                cycle_edited: newEditedSchedule,
            }, { where: { id: schedule_id }, transaction });
        });

        await Notification.bulkCreate(list_partner_ids.map(partner_id => ({
            user_id: partner_id,
            message: `You have a new meeting with ${title}`,
            seen: false,
        })));

        SSEService.sendToUsers(list_partner_ids, {
            type: "MEETING_UPDATE",
        });

        res.status(201).json(meeting);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: [error.message] });
    }
}

const updateMeeting = async (req, res) => {
    try {
        const { meeting_id, meeting_cycle_id, title, description, start_time, end_time, list_partner_ids, report } = req.body;
        if (!meeting_id || !meeting_cycle_id || !start_time || !end_time) {
            return res.status(400).json({ error: ["Missing required fields"] });
        }
        const meeting = await Meeting.findByPk(meeting_id);
        if (!meeting) {
            return res.status(400).json({ error: ["Meeting not found"] });
        }
        const meetingCycle = await MeetingCycle.findByPk(meeting_cycle_id);
        if (!meetingCycle) {
            return res.status(400).json({ error: ["Meeting cycle not found"] });
        }

        let partnerIdsNotifyRemove = [];
        let partnerIdsNotifyAdd = [];
        const newData = removeNullOrUndefined({ title, description, start_time, end_time, report });
        const errors = await validateAvailabilityMeeting(start_time, end_time, meetingCycle.id, title, meeting.id);
        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }
        if (list_partner_ids) {
            if (!Array.isArray(list_partner_ids) || list_partner_ids.length === 0) {
                return res.status(400).json({ error: ["List partner IDs is required"] });
            }
            newData.list_partner_ids = JSON.stringify(list_partner_ids);
            const oldPartnerIds = JSON.parse(meeting.list_partner_ids);
            const { removedIds: removedPartnerIds, addedIds: addedPartnerIds } = compareIdsArray(oldPartnerIds, list_partner_ids);
            partnerIdsNotifyRemove = removedPartnerIds;
            partnerIdsNotifyAdd = addedPartnerIds;
        }
        await meeting.update(newData);
        if (partnerIdsNotifyRemove.length > 0) {
            await Notification.bulkCreate(partnerIdsNotifyRemove.map(partner_id => ({
                user_id: partner_id,
                message: `You was removed from meeting ${meeting.title}`,
                seen: false,
            })));
        }
        if (partnerIdsNotifyAdd.length > 0) {
            await Notification.bulkCreate(partnerIdsNotifyAdd.map(partner_id => ({
                user_id: partner_id,
                message: `You have a new meeting with ${meeting.title}`,
                seen: false,
            })));
        }

        SSEService.sendToUsers([...partnerIdsNotifyRemove, ...partnerIdsNotifyAdd], {
            type: "MEETING_UPDATE",
        });
        // notify users
        //
        //

        res.status(200).json(meeting);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: [error.message] });
    }
}

const deleteMeeting = async (req, res) => {
    try {
        const { meeting_id } = req.body;
        if (!meeting_id) {
            return res.status(400).json({ error: ["Meeting ID is required"] });
        }
        const meeting = await Meeting.findByPk(meeting_id);
        if (!meeting) {
            return res.status(400).json({ error: ["Meeting not found"] });
        }
        await meeting.destroy();
        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
}

const getMeetingById = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        if (!meeting_id) {
            return res.status(400).json({ error: ["Meeting ID is required"] });
        }
        const meeting = await Meeting.findByPk(meeting_id);
        if (!meeting) {
            return res.status(400).json({ error: ["Meeting not found"] });
        }
        res.status(200).json(meeting);
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
}

const getMeetingsByCycleId = async (req, res) => {
    try {
        const { cycle_id } = req.params;
        if (!cycle_id) {
            return res.status(400).json({ error: ["Cycle ID is required"] });
        }
        const meetings = await Meeting.findAll({ where: { meeting_cycle_id: cycle_id } });
        res.status(200).json(meetings);
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
}

module.exports = {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByCycleId
};
