import { BASE_URL } from "@/utils/const";
import axios from "../index";

export async function getJobsByScheduleId(scheduleId, indexCycle, status) {
    return await axios.get(`${BASE_URL}/job/schedule/${scheduleId}`, {
        params: {
            indexCycle,
            status,
        },
    });
}

export async function updateJobApi({ payload }) {
    return await axios.put(`${BASE_URL}/job/${payload.jobId}`, payload);
}

export async function deleteJobApi({ jobId }) {
    return await axios.delete(`${BASE_URL}/job/${jobId}`);
}

export async function createJobApi({ payload }) {
    return await axios.post(`${BASE_URL}/job`, payload);
}

