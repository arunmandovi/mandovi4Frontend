// src/services/authService.js
import axiosInstance from "../api/axiosConfig";

const API = "/api/auth";

export const register = (data) => axiosInstance.post(`${API}/register`, data);
export const login = (data) => axiosInstance.post(`${API}/login`, data);
export const getUsers = () => axiosInstance.get(`${API}/users`);
export const approveUser = (id) => axiosInstance.put(`${API}/approve/${id}`);
