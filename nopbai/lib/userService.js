"use client";

import axiosClient from "./axiosClient";

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
  async getUsers(page = 1) {
    const res = await axiosClient.get("/admin/users", {
      params: { page },
      headers: getAuthHeaders(),
    });
    return res.data; // { data: [...], meta: {...} }
  },

  async getUser(id) {
    const res = await axiosClient.get(`/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data.data || res.data;
  },

  async updateUser(id, payload) {
    const res = await axiosClient.put(`/admin/users/${id}`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data.data || res.data;
  },

  async deleteUser(id) {
    const res = await axiosClient.delete(`/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};

export default userService;
