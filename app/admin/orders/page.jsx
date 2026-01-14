"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import adminOrderService from "../../lib/adminOrderService";

const STATUS = [
  { value: "", label: "Tất cả" },
  { value: "1", label: "Pending" },
  { value: "2", label: "Confirmed" },
  { value: "3", label: "Shipping" },
  { value: "4", label: "Completed" },
  { value: "0", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 20;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const params = useMemo(
    () => ({ q: q || undefined, status: status || undefined, from: from || undefined, to: to || undefined, page, per_page: perPage }),
    [q, status, from, to, page]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.list(params);
      const data = res.data;
      setRows(data.data || []);
      setMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.q, params.status, params.from, params.to, params.page]);

  const onSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Quản lý đơn hàng</div>
          <div className="text-sm text-gray-500">Tổng: {meta.total}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã đơn / tên / email / sđt"
            className="border rounded-xl px-3 py-2 w-full sm:col-span-2"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-3 py-2 w-full">
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="border rounded-xl px-3 py-2 w-full" />
          <input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="border rounded-xl px-3 py-2 w-full" />
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={onSearch} className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-semibold">
            Lọc / Tìm kiếm
          </button>
          <button
            onClick={() => {
              setQ("");
              setStatus("");
              setFrom("");
              setTo("");
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={7}>
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={7}>
                    Không có đơn hàng
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3 text-sm font-semibold">#{o.id}</td>
                    <td className="px-4 py-3 text-sm">{o.name}</td>
                    <td className="px-4 py-3 text-sm">{o.email}</td>
                    <td className="px-4 py-3 text-sm">{o.phone}</td>
                <td className="px-4 py-3 text-sm">
  {STATUS.find((s) => s.value === String(o.status))?.label || "-"}
</td>
                    <td className="px-4 py-3 text-sm">{o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Trang {meta.current_page} / {meta.last_page}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
