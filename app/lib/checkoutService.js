import axiosClient from "./axiosClient";

const checkoutService = {
  checkout(payload) {
    return axiosClient.post("/checkout", payload); 
  },
};

export default checkoutService;
