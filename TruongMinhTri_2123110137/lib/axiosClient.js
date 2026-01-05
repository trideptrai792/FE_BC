// app/lib/axiosClient.js
"use client";

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api",
  // withCredentials: true, // nếu bạn dùng cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Nếu cần token:
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosClient;
