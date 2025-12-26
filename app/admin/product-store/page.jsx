"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "../../lib/axiosClient"; // cùng mức với /admin/product/page.jsx

export default function AdminProductStorePage() {
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get("/admin/product-stores");
      const data = res.data || {};
      setStores(data.data || []);
      setMeta(data.meta || null);
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi tải tồn kho"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = async (store) => {
    const ok = confirm(
      `Bạn chắc chắn muốn xóa phiếu tồn kho #${store.id} (sản phẩm: ${store.product?.name || ""})?`
    );
    if (!ok) return;

    try {
      setError("");
      await axiosClient.delete(`/admin/product-stores/${store.id}`);
      alert("Xóa tồn kho thành công");
      setStores((prev) => prev.filter((s) => s.id !== store.id));
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi xóa tồn kho"
      );
    }
  };

  return (
    <div>
      {/* Header + nút thêm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý tồn kho sản phẩm</h2>
        <Link
          href="/admin/product-store/add"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm tồn kho
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-gray-500">
          Chưa có phiếu tồn kho nào.
        </p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Sản phẩm</th>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">Giá nhập</th>
              <th className="p-2 text-left">Số lượng</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-2">#{s.id}</td>
                <td className="p-2">
                  {s.product ? (
                    <div>
                      <div className="font-semibold">{s.product.name}</div>
                      <div className="text-xs text-gray-500">
                        #{s.product.id} – {s.product.slug}
                      </div>
                    </div>
                  ) : (
                    <span>#{s.product_id}</span>
                  )}
                </td>
                <td className="p-2">
                  {s.product?.thumbnail && (
                    <img
                      src={s.product.thumbnail}
                      alt={s.product.name}
                      className="w-12 h-12 object-contain border"
                    />
                  )}
                </td>
                <td className="p-2">
                  {Number(s.price_root || 0).toLocaleString("vi-VN")} đ
                </td>
                <td className="p-2">{s.qty}</td>
                <td className="p-2">
                  {s.status === 1 ? "Hoạt động" : "Không hoạt động"}
                </td>
                <td className="p-2 flex flex-wrap gap-2">
                  {/* Đi tới trang edit phiếu tồn kho */}
                  <Link
                    href={`/admin/product-store/edit/${s.id}`}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                  >
                    Sửa
                  </Link>

                  {/* Đi tới trang add, prefill product_id */}
                  <Link
                    href={`/admin/product-store/add?product_id=${s.product_id}`}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Nhập thêm
                  </Link>

                  {/* Xóa phiếu tồn kho */}
                  <button
                    onClick={() => handleDelete(s)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Nếu muốn hiện thông tin phân trang */}
      {meta && (
        <p className="mt-2 text-xs text-gray-500">
          Trang {meta.current_page} / {meta.last_page} – Tổng{" "}
          {meta.total} phiếu tồn kho
        </p>
      )}
    </div>
  );
}
