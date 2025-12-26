"use client";

import axiosClient from "../lib/axiosClient";

const postService = {
  async getAll() {
    const res = await axiosClient.get("/posts");
    const data = res.data;
    return data.data || data || [];
  },

  async getBySlug(slug) {
    const res = await axiosClient.get(`/posts/${slug}`);
    const data = res.data;
    return data.data ?? data;
  },

  async create(payload) {
    const res = await axiosClient.post("/posts", payload);
    const data = res.data;
    return data.data ?? data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/posts/${id}`, payload);
    const data = res.data;
    return data.data ?? data;
  },

  async remove(id) {
    return axiosClient.delete(`/posts/${id}`);
  },

  async uploadThumbnail(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axiosClient.post("/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data; // { url: "http://..." }
  },
};

export default postService;
