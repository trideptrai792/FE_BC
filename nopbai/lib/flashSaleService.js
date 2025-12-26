// app/lib/flashSaleService.js
"use client";

import axiosClient from "./axiosClient";

export const flashSaleService = {
  // Public: dùng cho trang Home (FlashSaleSection)
  async getPublicList() {
    // BE: GET /api/flash-sale
    const res = await axiosClient.get("/flash-sale");
    // Tuỳ BE, nhưng thường dùng Resource collection
    // { data: [...] }
    return res.data?.data || res.data || [];
  },

  // Admin: lấy flash sale hiện tại (nếu có màn edit sau này)
  async getCurrentAdmin() {
    // Ví dụ: GET /admin/flash-sales/current
    const res = await axiosClient.get("/admin/flash-sales/current");
    return res.data;
  },

  // Admin: tạo / cập nhật flash sale
  async save(payload) {
    // payload: { starts_at, ends_at, products: [{ product_id, sale_price }] }
    const res = await axiosClient.post("/admin/flash-sales", payload);
    return res.data;
  },

  // Admin: xoá flash sale (nếu có)
  async clear() {
    // Ví dụ: DELETE /admin/flash-sales
    const res = await axiosClient.delete("/admin/flash-sales");
    return res.data;
  },
};
