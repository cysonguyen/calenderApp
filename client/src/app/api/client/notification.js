import axios from "../index";
import { BASE_URL } from "@/utils/const";

export async function getNotificationApi({ userId }) {
    return await axios.get(`${BASE_URL}/notification/${userId}`);
}

export async function updateSeenNotificationApi({ userId }) {
    return await axios.put(`${BASE_URL}/notification/${userId}`);
}
