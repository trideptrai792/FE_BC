"use client";

import { useEffect, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import Link from "next/link";

export default function AdminProductSalePage() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    product_id: "",
    price_sale: "",
    date_begin: "",
    date_end: "",
    status: 1,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [resProducts, resSales] = await Promise.all([
        axiosClient.get("/products"),
        axiosClient.get("/admin/product-sales"),
      ]);

      const rawProducts = resProducts.data?.data || resProducts.data || [];
      setProducts(rawProducts.filter((p) => Number(p.stock ?? 0) > 0));
      setSales(resSales.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setError("");

      await axiosClient.post("/admin/product-sales", {
        name: form.name,
        product_id: Number(form.product_id),
        price_sale: Number(form.price_sale),
        date_begin: form.date_begin,
        date_end: form.date_end,
        status: Number(form.status),
      });

      alert("Thêm sale thành công");
      setForm({ product_id: "", price_sale: "", date_begin: "", date_end: "", status: 1 });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Lỗi thêm sale");
    }
  };

  const handleDelete = async (s) => {
    const ok = confirm(`Xóa sale #${s.id} ?`);
    if (!ok) return;

    try {
      setError("");
      await axiosClient.delete(`/admin/product-sales/${s.id}`);
      alert("Xóa sale thành công");
      setSales((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Lỗi xóa sale");
    }
  };

  const findProductName = (productId) => {
    const p = products.find((x) => String(x.id) === String(productId));
    return p?.name || `#${productId}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý giá Sale</h2>
      </div>

      {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

      {/* FORM THÊM SALE */}
      <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Sản phẩm</label>
          <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">-- chọn --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
  <label className="block font-medium mb-1">Tên chương trình</label>
  <input
    name="name"
    value={form.name}
    onChange={handleChange}
    className="w-full border rounded px-2 py-1"
    placeholder="Ví dụ: Khuyến mãi Giáng Sinh"
    required
  />
</div>


        <div>
          <label className="block font-medium mb-1">Giá sale</label>
          <input name="price_sale" type="number" value={form.price_sale} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Bắt đầu</label>
          <input name="date_begin" type="datetime-local" value={form.date_begin} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Kết thúc</label>
          <input name="date_end" type="datetime-local" value={form.date_end} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Trạng thái</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value={1}>Hoạt động</option>
            <option value={0}>Tắt</option>
          </select>
        </div>

        <div className="md:col-span-5 flex justify-end">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">
            Thêm sale
          </button>
        </div>
      </form>

      {/* LIST SALE */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Sản phẩm</th>
              <th className="p-2 text-left">Giá sale</th>
              <th className="p-2 text-left">Bắt đầu</th>
              <th className="p-2 text-left">Kết thúc</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-2">#{s.id}</td>
                <td className="p-2">{findProductName(s.product_id)}</td>
                <td className="p-2">{Number(s.price_sale || 0).toLocaleString("vi-VN")} đ</td>
                <td className="p-2">{String(s.date_begin || "")}</td>
                <td className="p-2">{String(s.date_end || "")}</td>
                <td className="p-2">{Number(s.status) === 1 ? "ON" : "OFF"}</td>
                <td className="p-2 flex gap-2">
                  <Link
                    href={`/admin/product-sale/${s.id}/edit`}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(s)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Chưa có sale nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
