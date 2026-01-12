"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import adminCartService from "../../lib/adminCartService";

export default function AdminCartsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await adminCartService.list();
        setItems(res.data?.data || []);
      } catch (e) {
        setErr("Không tải được danh sách giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.user?.name ?? "-"} ({c.user?.email ?? "-"})</td>
                <td className="p-3">{(c.items ?? []).length}</td>
                <td className="p-3">
                  <Link className="text-blue-600 underline" href={`/admin/carts/${c.id}`}>
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3" colSpan={4}>Không có giỏ hàng</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
