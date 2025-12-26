"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "../../lib/axiosClient"; // đường dẫn theo alias của bạn

export default function AdminProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/products");
      const data = res.data;
      setProducts(data.data || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product) => {
    const ok = confirm(`Bạn chắc chắn muốn xóa: "${product.name}" ?`);
    if (!ok) return;

    try {
      setError("");
      await axiosClient.delete(`/products/${product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      alert("Xóa sản phẩm thành công");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi xóa sản phẩm"
      );
    }
  };

  return (
    <div>
      {/* header + nút thêm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
        <Link
          href="/admin/product/add"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">Giá</th>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">Tồn kho</th> {/* thêm cột tồn kho */}
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2">{p.price}</td>
                <td className="p-2">
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-12 h-12 object-contain border"
                    />
                  )}
                </td>
                <td className="p-2">{p.stock ?? 0}</td> {/* hiển thị tồn kho */}
                <td className="p-2">
                  {p.status === 1 ? "Hiển thị" : "Ẩn"}
                </td>

                <td className="p-2 flex gap-2">
                  <Link
                    href={`/admin/product/${p.id}/edit`}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
