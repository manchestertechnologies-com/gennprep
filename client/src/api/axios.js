import axios from "axios";

// Every request goes to /api/... (Vite forwards it to the backend on port 5000)
const api = axios.create({ baseURL: "/api" });

// Before every request: if we have a login token, attach it
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Turns any error into a message we can show the user
export const getErrorMessage = (error) =>
    error.response?.data?.message || "Could not reach the server. Is it running?";

export default api;