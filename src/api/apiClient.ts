import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '@/storage/authStorage';
import { handle401Unauthorized } from '@/navigation/AppNavigator';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:8080/api/v1',
  default: 'http://localhost:8080/api/v1',
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      handle401Unauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
