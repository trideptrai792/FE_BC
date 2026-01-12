"use client";

import { useState } from "react";
import checkoutService from "../lib/checkoutService";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    payment_method: "cod",
  });

  const onPay = async () => {
    const res = await checkoutService.checkout(form);
    const data = res.data;

    if (data.payment_method === "vnpay" && data.payment_url) {
      window.location.href = data.payment_url;
      return;
    }

    alert("Đặt hàng thành công. Mã đơn: " + data.order_id);
  };

  return (
    <div className="p-6 space-y-3">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên" className="border p-2 w-full" />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border p-2 w-full" />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="SĐT" className="border p-2 w-full" />
      <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" className="border p-2 w-full" />

      <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="border p-2 w-full">
        <option value="cod">COD</option>
        <option value="vnpay">VNPay</option>
      </select>

      <button onClick={onPay} className="bg-black text-white px-4 py-2 rounded">
        Thanh toán
      </button>
    </div>
  );
}
