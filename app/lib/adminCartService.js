import axiosClient from "./axiosClient";

const adminCartService = {
  list(params) {
    return axiosClient.get("/admin/carts", { params, headers: { Accept: "application/json" } });
  },
  detail(id) {
    return axiosClient.get(`/admin/carts/${id}`, { headers: { Accept: "application/json" } });
  },
};

export default adminCartService;
