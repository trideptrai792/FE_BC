"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cartService from "../lib/cartService";

const fmt = (n) => `₫${Number(n || 0).toLocaleString("vi-VN")}`;

export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchCart = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data);
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        router.push("/login");
        return;
      }
      setErr("Không tải được giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const setQty = async (itemId, qty) => {
    try {
      setBusyId(itemId);
      await cartService.setQty(itemId, qty);
      await fetchCart();
    } catch (e) {
      setErr("Cập nhật số lượng thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setBusyId(itemId);
      await cartService.removeItem(itemId);
      await fetchCart();
    } catch (e) {
      setErr("Xóa sản phẩm thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  const clearCart = async () => {
    try {
      setClearing(true);
      await cartService.clear();
      await fetchCart();
    } catch (e) {
      setErr("Xóa giỏ hàng thất bại.");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <p className="text-red-600">{err}</p>
        <button onClick={fetchCart} className="mt-3 px-4 py-2 rounded bg-black text-white">
          Tải lại
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const summary = cart?.summary ?? {};
  const empty = items.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

      {empty ? (
        <div className="bg-white border rounded-lg p-6">
          <p>Giỏ hàng đang trống.</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 rounded bg-red-600 text-white">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.id} className="bg-white border rounded-lg p-4 flex gap-4">
                <div className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center">
                  <img src={it.image || "/images/noimage.png"} className="w-full h-full object-contain" alt={it.name} />
                </div>

                <div className="flex-1">
                  <Link href={`/products/${it.slug}`} className="font-semibold hover:underline">
                    {it.name}
                  </Link>

                  {it.variant && Object.keys(it.variant).length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      {Object.entries(it.variant).map(([k, v]) => (
                        <span key={k} className="mr-3">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mt-1">Tồn kho: {it.stock ?? "-"}</div>

                  <div className="mt-2 flex items-center gap-3">
                    <button
                      disabled={busyId === it.id}
                      onClick={() => setQty(it.id, Math.max(0, (it.qty || 1) - 1))}
                      className="w-9 h-9 border rounded disabled:opacity-60"
                    >
                      -
                    </button>

                    <span className="min-w-[32px] text-center">{it.qty}</span>

                    <button
                      disabled={busyId === it.id}
                      onClick={() => setQty(it.id, (it.qty || 1) + 1)}
                      className="w-9 h-9 border rounded disabled:opacity-60"
                    >
                      +
                    </button>

                    <button
                      disabled={busyId === it.id}
                      onClick={() => removeItem(it.id)}
                      className="ml-auto text-sm text-red-600 hover:underline disabled:opacity-60"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="text-right min-w-[120px]">
                  <div className="font-semibold">{fmt(it.unit_price)}</div>
                  <div className="text-sm text-gray-600 mt-1">{fmt(it.line_total)}</div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              disabled={clearing}
              className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-60"
            >
              {clearing ? "Đang xóa..." : "Xóa toàn bộ giỏ"}
            </button>
          </div>

          <div className="bg-white border rounded-lg p-5 h-fit">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{fmt(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>- {fmt(summary.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí ship</span>
                <span>{fmt(summary.shipping_fee)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Tổng</span>
                <span>{fmt(summary.total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="mt-5 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-500"
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
