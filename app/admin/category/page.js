"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

const emptyForm = {
  id: null,
  name: "",
  slug: "",
  status: 1,
};

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await fetch(`${API_BASE}/api/categories`);
      const json = await res.json();
      setCategories(json.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const url = isEditing
        ? `${API_BASE}/api/categories/${form.id}`
        : `${API_BASE}/api/categories`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("API error:", errJson || res.statusText);
        throw new Error("API trả về lỗi");
      }

      setMessage(isEditing ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công");
      setForm(emptyForm);
      setIsEditing(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage("Không lưu được danh mục. Kiểm tra lại API / dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
      status: category.status ?? 1,
    });
    setIsEditing(true);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("API error:", errJson || res.statusText);
        throw new Error("API trả về lỗi");
      }

      setMessage("Đã xóa danh mục");
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage("Không xóa được danh mục. Kiểm tra lại API.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setMessage("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quản lý danh mục</h2>
        {loading && <span className="text-sm text-gray-500">Đang xử lý...</span>}
      </div>

      {message && (
        <div className="mb-4 p-2 bg-yellow-100 text-sm text-gray-800 rounded">
          {message}
        </div>
      )}

      {/* FORM THÊM / SỬA */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Tên danh mục</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="whey-protein, mass-gainer..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>

        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            disabled={loading}
          >
            {isEditing ? "Cập nhật danh mục" : "Thêm danh mục"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* BẢNG DANH MỤC */}
      <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Tên danh mục</th>
            <th className="px-4 py-2 text-left">Slug</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {categories.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.id}</td>
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.slug}</td>
              <td className="px-4 py-2">
                {c.status === 1 ? "Hiển thị" : "Ẩn"}
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(c)}
                >
                  Sửa
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(c.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center">
                Chưa có danh mục nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
