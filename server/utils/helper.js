import dayjs from "dayjs";

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
}

export function validateMSSV(mssv) {
  const mssvRegex = /^\d{8}$/;
  return mssvRegex.test(mssv);
}

export function removeNullOrUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );
}

export function isOverlapTime(start_time, end_time, object) {
  const { start_time: object_start_time, end_time: object_end_time } = object;
  return (dayjs(start_time).isBefore(dayjs(object_start_time)) && dayjs(end_time).isBefore(dayjs(object_start_time))) ||
    (dayjs(start_time).isAfter(dayjs(object_end_time)) && dayjs(end_time).isAfter(dayjs(object_end_time)));
}

export function isInsideTime(start_time, end_time, object) {
  const { start_time: object_start_time, end_time: object_end_time } = object;
  return dayjs(start_time).isAfter(dayjs(object_start_time)) && dayjs(end_time).isBefore(dayjs(object_end_time));
}

export function compareIdsArray(oldArray, newArray) {
  if (!Array.isArray(oldArray) || !Array.isArray(newArray)) {
    return { removedIds: [], addedIds: [] };
  }
  const removedIds = oldArray.filter(id => !newArray.includes(id));
  const addedIds = newArray.filter(id => !oldArray.includes(id));
  return { removedIds, addedIds };
}

export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}


