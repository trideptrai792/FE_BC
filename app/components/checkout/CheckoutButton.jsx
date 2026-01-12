"use client";

import checkoutService from "@/services/checkoutService";

export default function CheckoutButton({ form }) {
  const onPay = async () => {
    const res = await checkoutService.checkout({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      note: form.note || "",
      payment_method: form.payment_method,
    });

    const data = res.data;

    if (data.payment_method === "vnpay" && data.payment_url) {
      window.location.href = data.payment_url;
      return;
    }

    alert("Đặt hàng thành công! Mã đơn: " + data.order_id);
  };

  return <button onClick={onPay}>Thanh toán</button>;
}
