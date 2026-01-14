"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/app/lib/orderService";

const STATUS = [
  { value: "1", label: "Pending" },
  { value: "2", label: "Confirmed" },
  { value: "3", label: "Shipping" },
  { value: "4", label: "Completed" },
  { value: "0", label: "Cancelled" },
];

export default function OrdersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await orderService.list({ per_page: 20 });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6">
      <div className="text-xl font-semibold mb-4">Đơn hàng đã xử lý</div>

      <div className="bg-white rounded border">
        <div className="grid grid-cols-12 font-semibold p-3 border-b">
          <div className="col-span-2">Mã</div>
          <div className="col-span-3">Người nhận</div>
          <div className="col-span-2">SĐT</div>
          <div className="col-span-3">Ngày</div>
          <div className="col-span-2">Trạng thái</div>
        </div>

        {data.data?.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="grid grid-cols-12 p-3 border-b hover:bg-gray-50"
          >
            <div className="col-span-2">#{o.id}</div>
            <div className="col-span-3">{o.name}</div>
            <div className="col-span-2">{o.phone}</div>
            <div className="col-span-3">
              {new Date(o.created_at).toLocaleString()}
            </div>
            <div className="col-span-2">
              {STATUS.find((s) => s.value === String(o.status))?.label || "-"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
