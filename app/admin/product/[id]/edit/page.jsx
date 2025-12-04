"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "../../../../lib/axiosClient";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  thumbnail: "",
  content: "",
  category_id: "",
  status: 1,
};

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Lấy list rồi find theo id (tránh 404 nếu không có /products/{id})
        const res = await axiosClient.get("/products");
        const data = res.data;
        const list = data.data || [];
        const p = list.find((item) => String(item.id) === String(id));

        if (!p) {
          setError(`Không tìm thấy sản phẩm với ID ${id}`);
          return;
        }

        setProductName(p.name || "");
        setForm({
          name: p.name || "",
          slug: p.slug || "",
          price: p.price?.replace(/[^\d.]/g, "") || "",
          thumbnail: p.thumbnail || "",
          content: p.content || "",
          category_id: p.category_id || "",
          status: p.status ?? 1,
        });
      } catch (e) {
        console.error(e);
        setError(e.message || "Không tải được thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosClient.post("/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      setForm((prev) => ({
        ...prev,
        thumbnail: data.url,
      }));

      alert("Upload ảnh thành công");
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || e.message || "Lỗi khi upload ảnh");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    try {
      setError("");

      const payload = {
        ...form,
        price: Number(form.price),
        category_id: form.category_id ? Number(form.category_id) : null,
        status: Number(form.status),
      };

      await axiosClient.put(`/products/${id}`, payload);

      alert("Cập nhật sản phẩm thành công");
      router.push("/admin/product");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi cập nhật sản phẩm"
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
          onClick={() => router.push("/admin/product")}
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
        <h2 className="text-xl font-bold">
          Sửa sản phẩm: {productName || `ID ${id}`}
        </h2>
        <button
          onClick={() => router.push("/admin/product")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giá</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thumbnail (URL)
          </label>
          <input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Hoặc để trống rồi chọn file bên dưới"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailFileChange}
            className="w-full text-sm"
          />

          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="Preview thumbnail"
              className="mt-2 w-24 h-24 object-contain border"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Category ID
          </label>
          <input
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
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

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/product")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
