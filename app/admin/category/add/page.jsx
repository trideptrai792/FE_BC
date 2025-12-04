"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../../../lib/axiosClient";

const emptyForm = {
  name: "",
  slug: "",
  status: 1,
};

export default function CategoryAddPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

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
      setError("");

      await axiosClient.post("/categories", {
        name: form.name,
        slug: form.slug,
        status: form.status,
      });

      alert("Thêm danh mục thành công");
      router.push("/admin/category");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Không lưu được danh mục"
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Thêm danh mục</h2>
        <button
          onClick={() => router.push("/admin/category")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Tên danh mục
          </label>
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

        <div className="md:col-span-3 flex gap-2 mt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            Lưu danh mục
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/category")}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
