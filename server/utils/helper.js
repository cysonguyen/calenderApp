const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const { INTERVAL } = require("./const");

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
}

function validateMSSV(msnv) {
  const mssvRegex = /^\d{8}$/;
  return mssvRegex.test(msnv);
}

function removeNullOrUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );
}

function isOverlapTime(start_time, end_time, object) {
  const { start_time: object_start_time, end_time: object_end_time } = object;

  return (
    dayjs(start_time).isBefore(dayjs(object_end_time)) &&
    dayjs(end_time).isAfter(dayjs(object_start_time))
  );
}

function isInsideTime(start_time, end_time, object) {
  const { start_time: object_start_time, end_time: object_end_time } = object;
  return (
    dayjs(start_time).isAfter(dayjs(object_start_time)) &&
    dayjs(end_time).isBefore(dayjs(object_end_time))
  );
}

function compareIdsArray(oldArray, newArray) {
  if (!Array.isArray(oldArray) || !Array.isArray(newArray)) {
    return { removedIds: [], addedIds: [] };
  }
  const removedIds = oldArray.filter((id) => !newArray.includes(id));
  const addedIds = newArray.filter((id) => !oldArray.includes(id));
  return { removedIds, addedIds };
}

function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

function addInterval(date, interval, count) {
  switch (interval) {
    case INTERVAL.DAY:
      return dayjs(date).add(count, "day");
    case INTERVAL.WEEK:
      return dayjs(date).add(count * 7, "day");
    case INTERVAL.MONTH:
      return dayjs(date).add(count, "month");
    case INTERVAL.YEAR:
      return dayjs(date).add(count, "year");
    default:
      throw new Error("Invalid interval");
  }
}

function timeRangesOverlap(startA, endA, startB, endB) {
  return dayjs(startA).isBefore(dayjs(endB)) && dayjs(endA).isAfter(dayjs(startB));
}

function isInsideTime(startA, endA, startB, endB) {
  const start = dayjs(startA);
  const end = dayjs(endA);
  const cycleStart = dayjs(startB);
  const cycleEnd = dayjs(endB);

  return !start.isBefore(cycleStart) && !end.isAfter(cycleEnd);
}

function generateCycleTime(
  baseStart,
  baseEnd,
  interval,
  intervalCount,
  index,
  isRepeat
) {
  if (!isRepeat) {
    return [dayjs(baseStart), dayjs(baseEnd)];
  }

  const cycleStart = addInterval(baseStart, interval, index * intervalCount);
  const durationMs = dayjs(baseEnd).diff(dayjs(baseStart));
  const cycleEnd = cycleStart.add(durationMs, "millisecond");
  return [cycleStart, cycleEnd];
}

module.exports = {
  validateEmail,
  validatePassword,
  validateMSSV,
  removeNullOrUndefined,
  isOverlapTime,
  isInsideTime,
  compareIdsArray,
  pick,
  addInterval,
  timeRangesOverlap,
  generateCycleTime,
  isInsideTime,
};
