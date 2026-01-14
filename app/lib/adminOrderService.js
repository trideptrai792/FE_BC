import axiosClient from "./axiosClient";

const adminOrderService = {
  list(params) {
    return axiosClient.get("/admin/orders", { params });
  },
  detail(id) {
    return axiosClient.get(`/admin/orders/${id}`);
  },
  updateStatus(id, status) {
    return axiosClient.patch(`/admin/orders/${id}/status`, { status });
  },
};

export default adminOrderService;
