import axios from "../index";
import { BASE_URL } from "@/utils/const";

export async function getReportByIdApi(reportId) {
    return await axios.get(`${BASE_URL}/report/${reportId}`);
}

export async function createReportApi({ report }) {
    return await axios.post(`${BASE_URL}/report`, report);
}

export async function updateReportApi({ reportId, report }) {
    return await axios.put(`${BASE_URL}/report/${reportId}`, report);
}

export async function deleteReportApi({ reportId }) {
    return await axios.delete(`${BASE_URL}/report/${reportId}`);
}