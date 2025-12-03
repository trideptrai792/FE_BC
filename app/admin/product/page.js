"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/api";

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null); // sản phẩm đang sửa
  const [isCreating, setIsCreating] = useState(false); // đang ở mode thêm mới hay không

  const emptyForm = {
    name: "",
    slug: "",
    price: "",
    thumbnail: "",
    content: "",
    category_id: "",
    status: 1,
  };

  const [form, setForm] = useState(emptyForm);

  const resetForm = () => setForm(emptyForm);

  // ============ LẤY TOKEN TỪ LOCALSTORAGE ============
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  // ============ LOAD DANH SÁCH SẢN PHẨM ============
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) {
        throw new Error("Không lấy được danh sách sản phẩm");
      }
      const data = await res.json();
      setProducts(data.data || []); // API paginate → data.data
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

  // ============ UPLOAD ẢNH THUMBNAIL ============
  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      // KHÔNG set "Content-Type": "application/json" cho FormData
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API_BASE}/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload ảnh thất bại");
      }

      const data = await res.json();

      // Gán URL ảnh vào field thumbnail của form
      setForm((prev) => ({
        ...prev,
        thumbnail: data.url,
      }));

      alert("Upload ảnh thành công");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi upload ảnh");
    }
  };

  // ============ CHỌN SẢN PHẨM ĐỂ SỬA ============
  const handleEditClick = (product) => {
    setIsCreating(false);
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      // BE đang trả price dạng đã format → loại bỏ ký tự không phải số/chấm
      price: product.price?.replace(/[^\d.]/g, "") || "",
      thumbnail: product.thumbnail || "",
      content: product.content || "",
      category_id: product.category_id || "",
      status: product.status ?? 1,
    });
  };

  // ============ BẤM THÊM SẢN PHẨM ============
  const handleCreateClick = () => {
    setEditingProduct(null);
    resetForm();
    setIsCreating(true);
  };

  // ============ CẬP NHẬT FORM ============
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ============ GỬI LÊN API ĐỂ CẬP NHẬT (PUT) ============
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setError("");
      const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          category_id: form.category_id ? Number(form.category_id) : null,
          status: Number(form.status),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật sản phẩm thất bại");
      }

      const updated = await res.json(); // ProductResource

      // cập nhật lại trong list
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.data.id ? updated.data : p))
      );
      setEditingProduct(null);
      alert("Cập nhật sản phẩm thành công");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi cập nhật sản phẩm");
    }
  };

  // ============ GỬI LÊN API ĐỂ THÊM MỚI (POST) ============
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          category_id: form.category_id ? Number(form.category_id) : null,
          status: Number(form.status),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Thêm sản phẩm thất bại");
      }

      const created = await res.json(); // ProductResource

      // thêm vào danh sách (đầu danh sách)
      setProducts((prev) => [created.data, ...prev]);

      resetForm();
      setIsCreating(false);
      alert("Thêm sản phẩm thành công");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi thêm sản phẩm");
    }
  };

  // ============ XÓA SẢN PHẨM ============
  const handleDelete = async (product) => {
    const ok = confirm(`Bạn chắc chắn muốn xóa: "${product.name}" ?`);
    if (!ok) return;

    try {
      setError("");
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Xóa sản phẩm thất bại");
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      alert("Xóa sản phẩm thành công");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi xóa sản phẩm");
    }
  };

  return (
    <div>
      {/* header + nút thêm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm sản phẩm
        </button>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          {/* BẢNG SẢN PHẨM */}
          <table className="w-full bg-white rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Slug</th>
                <th className="p-2 text-left">Giá</th>
                <th className="p-2 text-left">Ảnh</th>
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
                  <td className="p-2">
                    {p.status === 1 ? "Hiển thị" : "Ẩn"}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                    >
                      Sửa
                    </button>
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
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* FORM THÊM MỚI SẢN PHẨM */}
          {isCreating && (
            <div className="mt-8 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">
                Thêm sản phẩm mới
              </h3>

              <form
                onSubmit={handleCreateSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                    placeholder="Nếu để trống BE sẽ tự tạo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giá</label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Ví dụ: 1250000"
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

                  {/* input chọn file từ thư mục */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="w-full text-sm"
                  />

                  {/* preview ảnh sau khi chọn / upload */}
                  {form.thumbnail && (
                    <img
                      src={form.thumbnail}
                      alt="Preview thumbnail"
                      className="mt-2 w-24 h-24 object-contain border"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Mô tả
                  </label>
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
                    placeholder="Ví dụ: 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trạng thái
                  </label>
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
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                  >
                    Lưu sản phẩm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORM SỬA SẢN PHẨM */}
          {editingProduct && (
            <div className="mt-8 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">
                Sửa sản phẩm: {editingProduct.name}
              </h3>

              <form
                onSubmit={handleUpdateSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                  <label className="block text-sm font-medium mb-1">
                    Mô tả
                  </label>
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
                  <label className="block text-sm font-medium mb-1">
                    Trạng thái
                  </label>
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
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
