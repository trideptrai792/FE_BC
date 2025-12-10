"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import menuService from "../../lib/menuService";

export default function AdminMenuListPage() {
  const [menus, setMenus] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await menuService.getAdminList(p);
      setMenus(res.data || []);
      setMeta(res.meta || null);
      setPage(p);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || e.message || "Lỗi khi tải menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleDelete = async (m) => {
    const ok = confirm(`Xóa menu: "${m.name}" ?`);
    if (!ok) return;

    try {
      setError("");
      await menuService.remove(m.id);
      setMenus((prev) => prev.filter((x) => x.id !== m.id));
      alert("Đã xóa menu");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Không xóa được menu"
      );
    }
  };

  const handlePageChange = (newPage) => {
    if (!meta) return;
    if (newPage < 1 || newPage > meta.last_page) return;
    load(newPage);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý Menu</h2>
        <Link
          href="/admin/menus/add"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
        >
          Thêm menu
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <table className="w-full bg-white rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Link</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Sort</th>
                <th className="p-2 text-left">Parent</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{m.id}</td>
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.link}</td>
                  <td className="p-2">{m.type}</td>
                  <td className="p-2">{m.position}</td>
                  <td className="p-2">{m.sort_order}</td>
                  <td className="p-2">{m.parent_id ?? "-"}</td>
                  <td className="p-2">{m.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                  <td className="p-2 flex gap-2">
                    <Link
                      href={`/admin/menus/${m.id}/edit`}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(m)}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}

              {menus.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    Chưa có menu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center gap-3 mt-4 text-sm">
              <button
                onClick={() => handlePageChange(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={page <= 1}
              >
                « Trước
              </button>
              <span>
                Trang {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={page >= meta.last_page}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
