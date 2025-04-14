import axios from "../index";
import { BASE_URL } from "@/utils/const";

export async function getSchedules(userId) {
    return await axios.get(`${BASE_URL}/schedule/list/${userId}`);
}

export async function getScheduleById(scheduleId) {
    return await axios.get(`${BASE_URL}/schedule/${scheduleId}`);
}

export async function createSchedule({ userId, schedule }) {
    return await axios.post(`${BASE_URL}/schedule/${userId}`, schedule);
}

export async function updateSchedule({ scheduleId, schedule }) {
    return await axios.put(`${BASE_URL}/schedule/${scheduleId}`, schedule);
}

export async function deleteSchedule(scheduleId) {
    return await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
}


