"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import adminOrderService from "../../../lib/adminOrderService";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [summary, setSummary] = useState(null);
  const [newStatus, setNewStatus] = useState(1);
  const [statusOptions, setStatusOptions] = useState([]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.detail(id);
      setOrder(res.data.order);
      setSummary(res.data.summary);
      setStatusOptions(res.data.status_options || []);
      setNewStatus(res.data.order?.status ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const onUpdateStatus = async () => {
    await adminOrderService.updateStatus(id, Number(newStatus));
    await fetchDetail();
    alert("Đã cập nhật trạng thái");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Chi tiết đơn #{id}</div>
          <div className="text-sm text-gray-500">{order?.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : ""}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            Quay lại
          </Link>
          <button onClick={() => router.refresh()} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
          <div className="text-sm font-semibold">Sản phẩm</div>

          {loading ? (
            <div className="mt-3 text-sm text-gray-500">Đang tải...</div>
          ) : (
            <div className="mt-3 space-y-3">
              {(order?.details || []).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                  <div>
                    <div className="text-sm font-semibold">{d.product?.name || `Product #${d.product_id}`}</div>
                    <div className="text-xs text-gray-500">
                      Giá: {Number(d.price).toLocaleString("vi-VN")} • SL: {d.qty}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{Number(d.amount).toLocaleString("vi-VN")}₫</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
          <div className="text-sm font-semibold">Thông tin đơn</div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Khách</span><span className="font-semibold">{order?.name || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{order?.email || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SĐT</span><span className="font-semibold">{order?.phone || "-"}</span></div>
            <div className="pt-2">
              <div className="text-gray-500 text-xs">Địa chỉ</div>
              <div className="font-semibold">{order?.address || "-"}</div>
            </div>

            <div className="pt-3 border-t">
              <div className="text-gray-500 text-xs">Tổng</div>
              <div className="text-lg font-semibold">
                {summary ? Number(summary.total).toLocaleString("vi-VN") : "0"}₫
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Thay đổi trạng thái</div>
            <div className="flex gap-2">
              <select
  value={newStatus}
  onChange={(e) => setNewStatus(Number(e.target.value))}
  className="border rounded-xl px-3 py-2"
>
  {statusOptions.map((s) => (
    <option key={s.value} value={s.value}>
      {s.label}
    </option>
  ))}
</select>
              <button onClick={onUpdateStatus} className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-semibold">
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
