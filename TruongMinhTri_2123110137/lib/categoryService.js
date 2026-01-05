"use client";

import axiosClient from "../lib/axiosClient";

const categoryService = {
  async getAll() {
    const res = await axiosClient.get("/categories");
    const data = res.data;
    return data.data || data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/categories/${id}`);
    const data = res.data;
    return data.data ?? data;
  },

  async create(payload) {
    const res = await axiosClient.post("/categories", payload);
    const data = res.data;
    return data.data ?? data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/categories/${id}`, payload);
    const data = res.data;
    return data.data ?? data;
  },

  async remove(id) {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
