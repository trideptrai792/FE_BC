"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "../../lib/axiosClient";

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/categories");
      const data = res.data;
      setCategories(data.data || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (cat) => {
    const ok = confirm(`Bạn chắc chắn muốn xóa danh mục: "${cat.name}"?`);
    if (!ok) return;

    try {
      setError("");
      await axiosClient.delete(`/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      alert("Đã xóa danh mục");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Không xóa được danh mục"
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quản lý danh mục</h2>
        <Link
          href="/admin/category/add"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm danh mục
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Tên danh mục</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.slug}</td>
                <td className="px-4 py-2">
                  {c.status === 1 || c.status === "1" ? "Hiển thị" : "Ẩn"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Link
                    href={`/admin/category/${c.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </Link>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(c)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
