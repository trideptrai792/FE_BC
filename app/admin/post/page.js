"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/api";

export default function AdminPostPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPost, setEditingPost] = useState(null); // null = đang tạo mới
  const [form, setForm] = useState({
    title: "",
    slug: "",
    thumbnail: "",
    excerpt: "",
    content: "",
    status: 1,
  });
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
  // ===== helper lấy token =====
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" };
  };

  // ===== load danh sách post =====
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) {
        throw new Error("Không lấy được danh sách bài viết");
      }
      const data = await res.json();
      setPosts(data.data || []); // paginate: data.data
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ===== change form =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===== click "Sửa" =====
  const handleEditClick = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      thumbnail: post.thumbnail || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status ?? 1,
    });
  };

  // ===== click "Tạo mới" =====
  const handleCreateNew = () => {
    setEditingPost(null);
    setForm({
      title: "",
      slug: "",
      thumbnail: "",
      excerpt: "",
      content: "",
      status: 1,
    });
  };

  // ===== submit form (create / update) =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const isEdit = !!editingPost;
      const url = isEdit
        ? `${API_BASE}/posts/${editingPost.id}`
        : `${API_BASE}/posts`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (isEdit ? "Cập nhật thất bại" : "Tạo mới thất bại"));
      }

      const result = await res.json(); // PostResource

      if (isEdit) {
        setPosts((prev) =>
          prev.map((p) => (p.id === result.data.id ? result.data : p))
        );
        alert("Cập nhật bài viết thành công");
      } else {
        setPosts((prev) => [result.data, ...prev]);
        alert("Tạo bài viết mới thành công");
      }

      setEditingPost(null);
      handleCreateNew();
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi lưu bài viết");
    }
  };

  // ===== xóa post =====
  const handleDelete = async (post) => {
    const ok = confirm(`Bạn chắc chắn muốn xóa bài: "${post.title}" ?`);
    if (!ok) return;

    try {
      setError("");
      const res = await fetch(`${API_BASE}/posts/${post.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Xóa bài viết thất bại");
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      alert("Xóa bài viết thành công");
    } catch (e) {
      console.error(e);
      setError(e.message || "Lỗi khi xóa bài viết");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quản lý bài viết (Post)</h2>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {/* Nút tạo mới */}
      <div className="mb-4">
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-sm"
        >
          + Tạo bài viết mới
        </button>
      </div>

      {/* Bảng danh sách post */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Tiêu đề</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">Thumbnail</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2">
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
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

            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Chưa có bài viết nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Form tạo / sửa bài viết */}
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">
          {editingPost ? `Sửa bài viết: ${editingPost.title}` : "Tạo bài viết mới"}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Tiêu đề
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Slug (tùy chọn)
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              placeholder="Nếu để trống sẽ tự sinh từ title"
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Mô tả ngắn (excerpt)
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 h-20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nội dung chi tiết
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 h-32"
            />
          </div>

          <div className="md:col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              {editingPost ? "Lưu thay đổi" : "Tạo bài viết"}
            </button>

            {editingPost && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy sửa / Tạo mới
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
