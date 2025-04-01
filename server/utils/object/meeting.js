const { Meeting, MeetingCycle } = require("../../models");
const { isOverlapTime, isInsideTime } = require("../helper");
const dayjs = require("dayjs");

async function validateAvailabilityMeeting(startTime, endTime, meetingCycleId, title, meetingId = null) {
    const errors = [];
    if (dayjs(startTime).isAfter(dayjs(endTime))) {
        errors.push("Start time must be before end time");
        return errors;
    }
    const meetingCycle = await MeetingCycle.findByPk(meetingCycleId, {
        include: [{
            model: Meeting
        }]
    });
    if (meetingCycle) {
        const meetingsData = meetingCycle.get({ plain: true });
        const { Meetings: meetings } = meetingsData;

        if (!isInsideTime(startTime, endTime, meetingsData)) {
            errors.push("Meeting not available schedule time");
            return errors;
        }

        for (const meeting of meetings.filter(meeting => meeting.id !== meetingId)) {
            if (title && meeting.title == title) {
                errors.push("Meeting title already exists");
                return errors;
            }
            if (!isOverlapTime(startTime, endTime, meeting)) {
                errors.push("Meeting not available time");
                return errors;
            }
        }
    }
    return errors;
}

module.exports = {
    validateAvailabilityMeeting
};
