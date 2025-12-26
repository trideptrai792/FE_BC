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
async getByCategorySlug(slug, page = 1) {
    const res = await axiosClient.get("/products", {
      params: { category: slug, page },
    });
    return res.data?.data || [];
  },
  async getNew(limit = 10) {
const res = await axiosClient.get("products/new", { params: { limit } });

  return res.data?.data || [];
},

  // thêm hàm khác nếu cần
  // async create(payload) { ... }
  // async update(id, payload) { ... }
};
