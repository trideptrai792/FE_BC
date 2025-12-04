"use client";

import axiosClient from "../lib/axiosClient";

export const productService = {
  async getAll() {
    const res = await axiosClient.get("/products");
    return res.data.data || [];
  },

  async getBySlug(slug) {
    const res = await axiosClient.get(`/products/${slug}`);
    return res.data.data || null;
  },

  // thêm hàm khác nếu cần
  // async create(payload) { ... }
  // async update(id, payload) { ... }
};
