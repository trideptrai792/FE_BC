"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/app/lib/orderService";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await orderService.detail(id);
      setPayload(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!payload) return <div className="p-6">No data</div>;

  const { order, summary } = payload;

  return (
    <div className="p-6">
      <div className="text-xl font-semibold mb-4">Chi tiết đơn #{order.id}</div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 md:col-span-6 bg-white rounded border p-4">
          <div className="font-semibold mb-2">Thông tin giao hàng</div>
          <div>Họ tên: {order.name}</div>
          <div>Email: {order.email}</div>
          <div>SĐT: {order.phone}</div>
          <div>Địa chỉ: {order.address}</div>
          <div>Trạng thái: {order.status}</div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-white rounded border p-4">
          <div className="font-semibold mb-2">Tổng kết</div>
          <div>Tạm tính: {summary.subtotal}</div>
          <div>Giảm giá: {summary.discount}</div>
          <div className="font-semibold">Tổng: {summary.total}</div>
        </div>
      </div>

      <div className="bg-white rounded border">
        <div className="grid grid-cols-12 font-semibold p-3 border-b">
          <div className="col-span-6">Sản phẩm</div>
          <div className="col-span-2">SL</div>
          <div className="col-span-2">Giá</div>
          <div className="col-span-2">Thành tiền</div>
        </div>

        {order.details?.map((d) => (
          <div key={d.id} className="grid grid-cols-12 p-3 border-b">
            <div className="col-span-6">{d.product?.name ?? "N/A"}</div>
            <div className="col-span-2">{d.quantity}</div>
            <div className="col-span-2">{d.price}</div>
            <div className="col-span-2">{d.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
