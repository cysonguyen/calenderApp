import axios from "../index";
import { BASE_URL } from "@/utils/const";

export async function getSchedulesApi({ userId, dateRange, ...query }) {
    return await axios.get(`${BASE_URL}/schedule/list/${userId}`, {
        params: { ...dateRange, ...query },
    });
}

export async function getScheduleByIdApi({ scheduleId, dateRange, ...query }) {
    console.log('scheduleId', scheduleId);
    return await axios.get(`${BASE_URL}/schedule/${scheduleId}`, {
        params: {
            ...dateRange,
            ...query,
        },
    });
}

export async function createScheduleApi({ userId, schedule }) {
    return await axios.post(`${BASE_URL}/schedule/${userId}`, schedule);
}

export async function updateScheduleApi({ userId, scheduleId, schedule }) {
    return await axios.put(`${BASE_URL}/schedule/${userId}`, { ...schedule, scheduleId });
}

export async function deleteScheduleApi(scheduleId) {
    return await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
}
