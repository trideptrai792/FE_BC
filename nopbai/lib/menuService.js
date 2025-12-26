"use client";

import axiosClient from "./axiosClient";

const menuService = {
  // --- ADMIN API ---

  async getAdminList(page = 1) {
    const res = await axiosClient.get(`/admin/menus?page=${page}`);
    return res.data; // { data, meta }
  },

  // Bỏ hàm này nếu BE chưa có route /admin/menus/{id}
  async getById(id) {
    const res = await axiosClient.get(`/admin/menus/${id}`);
    return res.data.data || res.data;
  },

  async create(payload) {
    const body = {
      name: payload.name,
      link: payload.link,
      type: payload.type,
      position: payload.position,
      sort_order: Number(payload.sort_order) || 0,
      parent_id: payload.parent_id ? Number(payload.parent_id) : null,
      status: Number(payload.status),
    };
    const res = await axiosClient.post("/admin/menus", body);
    return res.data.data || res.data;
  },

  async update(id, payload) {
    const body = {
      name: payload.name,
      link: payload.link,
      type: payload.type,
      position: payload.position,
      sort_order: Number(payload.sort_order) || 0,
      parent_id: payload.parent_id ? Number(payload.parent_id) : null,
      status: Number(payload.status),
    };
    const res = await axiosClient.put(`/admin/menus/${id}`, body);
    return res.data.data || res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/admin/menus/${id}`);
  },

  // --- CLIENT PUBLIC ---

  async getByPosition(position = "mainmenu") {
    const res = await axiosClient.get("/menus", { params: { position } });
    return res.data.data || res.data;
  },

  // alias để Header gọi cho đúng
  fetchMenusByPosition(position = "mainmenu") {
    return this.getByPosition(position);
  },
};

export default menuService;
