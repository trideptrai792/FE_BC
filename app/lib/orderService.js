import axiosClient from "./axiosClient";

export const orderService = {
  list: (params = {}) => axiosClient.get("/orders", { params }),
  detail: (id) => axiosClient.get(`/orders/${id}`),
};
