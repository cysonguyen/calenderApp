'use client';
import { ROLES } from "@/utils/const";
import axios from "../index";
const BASE_URL = "http://localhost:5000/api";

export async function login(formData) {
    return await axios.post(`${BASE_URL}/auth/login`, formData);
};

export async function register(formData) {
    return await axios.post(`${BASE_URL}/auth/register`, formData);
};

export async function getUser(id) {
    return await axios.get(`${BASE_URL}/account/info/${id}`);
};

export async function changePasswordApi(passwordInfo, id) {
    return await axios.put(`${BASE_URL}/account/password/${id}`, passwordInfo);
};

export async function changeInfoApi(info, id) {
    return await axios.patch(`${BASE_URL}/account/info/${id}`, info);
};

export async function getGroupsApi(userId) {
    return await axios.get(`${BASE_URL}/account/groups/${userId}`);
};

export async function getGroupByQueryApi(query) {
    return await axios.get(`${BASE_URL}/account/groups`, {
        params: query
    });
};

export async function getGroupByIdApi(groupId) {
    return await axios.get(`${BASE_URL}/account/group/${groupId}`);
};

export async function updateGroupApi(groupId, group) {
    return await axios.put(`${BASE_URL}/account/group/${groupId}`, group);
};

export async function createGroupApi(group) {
    return await axios.post(`${BASE_URL}/account/group`, group);
};

export async function getStudentsApi({ id, full_name, email, mssv, username, role = ROLES.STUDENT }) {
    return await axios.get(`${BASE_URL}/account/info`, {
        params: {
            role,
            id,
            full_name,
            email,
            mssv,
            username
        }
    });
};

export async function createStudentApi(student) {
    return await axios.post(`${BASE_URL}/account/student`, student);
};

