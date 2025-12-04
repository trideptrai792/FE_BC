"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "../../../../lib/axiosClient";

const emptyForm = {
  name: "",
  slug: "",
  status: 1,
};

export default function CategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [catName, setCatName] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get("/categories");
        const data = res.data;
        const list = data.data || [];

        const c = list.find((item) => String(item.id) === String(id));

        if (!c) {
          setError(`Không tìm thấy danh mục với ID ${id}`);
          return;
        }

        setCatName(c.name || "");
        setForm({
          name: c.name || "",
          slug: c.slug || "",
          status: c.status ?? 1,
        });
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message ||
            e.message ||
            "Không tải được thông tin danh mục"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    try {
      setError("");

      await axiosClient.put(`/categories/${id}`, {
        name: form.name,
        slug: form.slug,
        status: form.status,
      });

      alert("Cập nhật danh mục thành công");
      router.push("/admin/category");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message ||
          e.message ||
          "Không cập nhật được danh mục"
      );
    }
  };

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600 mb-4 text-sm">{error}</p>
        <button
          onClick={() => router.push("/admin/category")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Sửa danh mục: {catName || `ID ${id}`}
        </h2>
        <button
          onClick={() => router.push("/admin/category")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            Lưu thay đổi
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
