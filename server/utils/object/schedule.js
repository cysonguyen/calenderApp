const dayjs = require("dayjs");
const { User, Schedule } = require("../../models");
const {
  isOverlapTime,
  addInterval,
  generateCycleTime,
  timeRangesOverlap,
} = require("../helper");

async function validateAvailabilitySchedule(newSchedule, userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Schedule,
        through: { attributes: [] },
      },
    ],
  });
  const usersData = user.get({ plain: true });
  const schedules = usersData.Schedules;

  const acceptedSchedules = schedules.filter((schedule) => JSON.parse(schedule.accepted_ids).some((id) => id == userId));
  const errors = [];
  const conflict = findFirstConflict(newSchedule, acceptedSchedules);
  if (conflict) {
    errors.push({
      message: "Conflict with schedule",
      errors: conflict,
    });
  }
  return errors;
}

function getMaxCycle(start_time, interval) {
  const maxCycle = 62;
  const maxTime = dayjs(start_time)
    .add(maxCycle, interval)
    .isBefore(dayjs(start_time).add(2, "year"))
    ? dayjs(start_time).add(maxCycle, interval)
    : dayjs(start_time).add(2, "year");
  return maxTime;
}
function getMeetingCycles(
  schedule,
  start_time_query = new Date(),
  end_time_query = new Date(),
  limit
) {
  const {
    start_time,
    end_time,
    interval,
    interval_count,
    is_repeat,
    when_expired,
  } = schedule;
  const meetingCycles = [];
  const maxTimeQuery = end_time_query
    ? dayjs(end_time_query)
    : getMaxCycle(start_time, interval);
  const maxTime = when_expired
    ? dayjs(when_expired).isAfter(maxTimeQuery)
      ? maxTimeQuery
      : when_expired
    : maxTimeQuery;
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
    startTime = startTime.add(interval_count, interval);
    endTime = endTime.add(interval_count, interval);
    if (!is_repeat) break;
  }
  return meetingCycles;
}

function replaceExistCycle(savedCycles, generatedCycles) {
  const map = new Map();
  for (const g of generatedCycles) {
    map.set(g.cycle_index, g);
  }
  for (const s of savedCycles) {
    map.set(s.cycle_index, s);
  }

  return [...map.values()].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
}

// 🔍 Kiểm tra trùng lặp giữa lịch mới và các lịch cũ
function findFirstConflict(scheduleNew, schedulesExisting, maxYears = 2) {
  const maxCheckDate = addInterval(scheduleNew.start_time, "YEAR", maxYears);

  const getMaxCycles = (start, interval, count, whenExpires) => {
    const limit = whenExpires ? dayjs(whenExpires) : maxCheckDate;
    let i = 0,
      current = dayjs(start);
    while (current.isSameOrBefore(limit) && i < 1000) {
      i++;
      current = addInterval(start, interval, i * count);
    }
    return i;
  };

  const newMaxCycles = scheduleNew.is_repeat
    ? getMaxCycles(
      scheduleNew.start_time,
      scheduleNew.interval,
      scheduleNew.interval_count,
      scheduleNew.when_expired
    )
    : 1;

  for (let existing of schedulesExisting) {
    const existMaxCycles = existing.is_repeat
      ? getMaxCycles(
        existing.start_time,
        existing.interval,
        existing.interval_count,
        existing.when_expired
      )
      : 1;

    for (let i = 0; i < existMaxCycles; i++) {
      const [startE, endE] = generateCycleTime(
        existing.start_time,
        existing.end_time,
        existing.interval,
        existing.interval_count,
        i,
        existing.is_repeat
      );

      for (let j = 0; j < newMaxCycles; j++) {
        const [startN, endN] = generateCycleTime(
          scheduleNew.start_time,
          scheduleNew.end_time,
          scheduleNew.interval,
          scheduleNew.interval_count,
          j,
          scheduleNew.is_repeat
        );

        if (
          timeRangesOverlap(startE, endE, startN, endN) &&
          scheduleNew.id !== existing.id
        ) {
          return {
            conflict_with_schedule_id: existing.id,
            conflict_cycle_index: i,
            new_schedule_cycle_index: j,
            conflict_time: {
              existing: {
                start: startE.toISOString(),
                end: endE.toISOString(),
              },
              new: { start: startN.toISOString(), end: endN.toISOString() },
            },
          };
        }
      }
    }
  }

  return null;
}

module.exports = {
  validateAvailabilitySchedule,
  getMeetingCycles,
  replaceExistCycle,
  findFirstConflict,
};
