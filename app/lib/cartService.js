import axiosClient from "./axiosClient";

const cartService = {
  getCart() {
    return axiosClient.get("/cart");
  },
  addItem(payload) {
    return axiosClient.post("/cart/items", payload);
  },
  setQty(itemId, qty) {
    return axiosClient.patch(`/cart/items/${itemId}`, { qty });
  },
  removeItem(itemId) {
    return axiosClient.delete(`/cart/items/${itemId}`);
  },
  clear() {
    return axiosClient.delete("/cart/clear");
  },
  updateCart(payload) {
    return axiosClient.patch("/cart", payload);
  },
};

export default cartService;
