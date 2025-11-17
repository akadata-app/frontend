// src/services/authService.js
import axios from 'axios';

// Usa VITE_API_URL si está definida; si no, usa URL relativa para proxy de Vite
// En desarrollo local: VITE_API_URL=http://localhost:8080
// En Docker: no definir VITE_API_URL para usar el proxy de Vite (/api -> http://back:8080/api)
const API_BASE = import.meta?.env?.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : ''; // URL vacía usa el proxy de Vite configurado en vite.config.js
const API_URL = API_BASE ? `${API_BASE}/api` : '/api';

axios.interceptors.request.use(
  (config) => {
    if (
      !config.url.endsWith('/login') &&
      !config.url.endsWith('/register') &&
      !config.url.endsWith('/reset-password')
    ) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('jwtToken', response.data.token);
    if (response.data.name) {
      localStorage.setItem('userName', response.data.name);
    }
    if (response.data.role) {
      localStorage.setItem('userRole', response.data.role);
    }
  }
  return response;
}

export function getUserName() {
  return localStorage.getItem('userName');
}

export async function register(userData) {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response;
}

export function getToken() {
  return localStorage.getItem('jwtToken');
}

export function logout() {
  localStorage.removeItem('jwtToken');
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getUserInfo() {
  return axios.get(`${API_URL}/user/me`)
}

export function updateUserInfo(data) {
  return axios.put(`${API_URL}/user/update`, data)
}

export function getUserRoles() {
  return axios.get(`${API_URL}/user/roles`)
}

export function getUserRole() {
  return localStorage.getItem('userRole');
}

export async function resetPassword(email) {
  return axios.post(`${API_URL}/user/reset-password`, { email })
}
