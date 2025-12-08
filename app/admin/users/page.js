"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import userService from "../../lib/userService"; // app/admin/users → ../../lib

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await userService.getUsers(page);
      setUsers(res.data || []);
      setMeta(res.meta || {});
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  const handlePageChange = (page) => {
    if (page < 1 || page > meta.last_page) return;
    loadUsers(page);
  };

  const handleDelete = async (user) => {
    const ok = confirm(`Xóa user "${user.name}" (ID: ${user.id})?`);
    if (!ok) return;

    try {
      setError("");
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert("Đã xóa user thành công");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi xóa người dùng"
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
        {loading && (
          <span className="text-sm text-gray-500">Đang tải...</span>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <table className="w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Ngày tạo</th>
            <th className="p-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">
                <span
                  className={
                    u.roles === "admin"
                      ? "inline-block px-2 py-1 rounded text-xs bg-red-100 text-red-700"
                      : "inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-700"
                  }
                >
                  {u.roles}
                </span>
              </td>
              <td className="p-2">
                {u.created_at
                  ? u.created_at.slice(0, 19).replace("T", " ")
                  : ""}
              </td>
              <td className="p-2 flex gap-2">
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => handleDelete(u)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && !loading && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                Chưa có người dùng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {meta.total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span>
            Trang {meta.current_page} / {meta.last_page} – Tổng: {meta.total} user
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => handlePageChange(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
