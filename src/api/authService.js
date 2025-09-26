import axios from "axios";
const API = "http://localhost:8080/api/auth";

export const register = (data) => axios.post(`${API}/register`, data);
export const login = (data) => axios.post(`${API}/login`, data);
export const getUsers = () => axios.get(`${API}/users`);
export const approveUser = (id) => axios.put(`${API}/approve/${id}`);
