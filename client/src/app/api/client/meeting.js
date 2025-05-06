import axios from "../index";
import { BASE_URL } from "@/utils/const";

export async function getMeetingByIdApi(meetingId) {
  return await axios.get(`${BASE_URL}/meeting/${meetingId}`);
}

export async function createMeetingApi({ meeting }) {
  return await axios.post(`${BASE_URL}/meeting`, meeting);
}

export async function updateMeetingApi({ meetingId, meeting }) {
  return await axios.put(`${BASE_URL}/meeting/${meetingId}`, meeting);
}

export async function deleteMeetingApi(meetingId) {
  return await axios.delete(`${BASE_URL}/meeting/${meetingId}`);
}
