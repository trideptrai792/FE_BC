"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import adminCartService from "../../lib/adminCartService";

const fmt = (n) => `₫${Number(n || 0).toLocaleString("vi-VN")}`;

export default function AdminCartDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await adminCartService.detail(id);
        setCart(res.data);
      } catch {
        setErr("Không tải được chi tiết giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!cart) return <div className="p-6">Không có dữ liệu</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Cart #{cart.id}</h1>
      <p className="text-sm text-gray-700 mb-4">
        User: {cart.user?.name ?? "-"} ({cart.user?.email ?? "-"})
      </p>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Sản phẩm</th>
              <th className="text-left p-3">Variant</th>
              <th className="text-left p-3">Qty</th>
            </tr>
          </thead>
          <tbody>
            {(cart.items ?? []).map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.product?.name ?? it.product_id}</td>
                <td className="p-3">{it.variant_json ? JSON.stringify(it.variant_json) : "-"}</td>
                <td className="p-3">{it.qty}</td>
              </tr>
            ))}
            {(cart.items ?? []).length === 0 && (
              <tr>
                <td className="p-3" colSpan={3}>Giỏ trống</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
