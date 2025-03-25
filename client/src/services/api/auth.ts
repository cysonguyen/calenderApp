import axios from '../axios';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await axios.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
}; 