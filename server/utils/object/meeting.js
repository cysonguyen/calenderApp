const dayjs = require("dayjs");
const { timeRangesOverlap, isInsideTime } = require("../helper");

async function validateAvailabilityMeeting(
  startTime,
  endTime,
  meetingCycle,
  title,
  meetingId = null
) {
  const errors = [];

  if (dayjs(startTime).isAfter(dayjs(endTime))) {
    errors.push("Start time must be before end time");
    return errors;
  }

  if (!meetingCycle) {
    errors.push("Meeting cycle not found");
    return errors;
  }

  const { Meetings: meetings } = meetingCycle;

  if (
    !isInsideTime(
      startTime,
      endTime,
      meetingCycle.start_time,
      meetingCycle.end_time
    )
  ) {
    errors.push("Meeting not available schedule time");
    return errors;
  }

  if (!meetings?.length > 0) return errors;
  for (const meeting of meetings) {
    if (meeting.id === meetingId) continue;

    if (title && meeting.title === title) {
      errors.push("Meeting title already exists");
      return errors;
    }

    if (
      timeRangesOverlap(
        startTime,
        endTime,
        meeting.start_time,
        meeting.end_time
      )
    ) {
      errors.push("Meeting not available time");
      return errors;
    }
  }

  return errors;
}

module.exports = {
  validateAvailabilityMeeting,
};
