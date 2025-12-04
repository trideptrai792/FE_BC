"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "../../lib/axiosClient";

export default function AdminPostListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/posts");
      const data = res.data;
      setPosts(data.data || []);
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

  const handleDelete = async (post) => {
    const ok = confirm(`Bạn chắc chắn muốn xóa: "${post.title}" ?`);
    if (!ok) return;

    try {
      setError("");
      await axiosClient.delete(`/posts/${post.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      alert("Xóa bài viết thành công");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi xóa bài viết"
      );
    }
  };

  return (
    <div>
      {/* header + nút thêm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý bài viết</h2>
        <Link
          href="/admin/post/add"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm bài viết
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
              <th className="p-2 text-left">Tiêu đề</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.id}</td>
                <td className="p-2 line-clamp-1">{p.title}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2">
                  {p.status === 1 || p.status === "1" ? "Hiển thị" : "Ẩn"}
                </td>
                <td className="p-2 flex gap-2">
                  <Link
                    href={`/admin/post/${p.id}/edit`}
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

            {posts.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Chưa có bài viết nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
