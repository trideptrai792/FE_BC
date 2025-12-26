"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "../../../../lib/axiosClient";

const emptyForm = {
  price_root: "",
  qty: "",
  status: 1,
};

export default function AdminProductStoreEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [store, setStore] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchStore = async () => {
      try {
        setLoading(true);
        setError("");

        // BE chưa có show => lấy list rồi find theo id
        const res = await axiosClient.get("/admin/product-stores");
        const data = res.data || {};
        const list = data.data || [];
        const s = list.find((x) => String(x.id) === String(id));

        if (!s) {
          setError(`Không tìm thấy phiếu tồn kho với ID ${id}`);
          return;
        }

        setStore(s);
        setForm({
          price_root:
            s.price_root === null || typeof s.price_root === "undefined"
              ? ""
              : String(s.price_root),
          qty:
            s.qty === null || typeof s.qty === "undefined" ? "" : String(s.qty),
          status: s.status ?? 1,
        });
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        price_root: form.price_root === "" ? null : Number(form.price_root),
        qty: form.qty === "" ? 0 : Number(form.qty),
        status: Number(form.status),
      };

      await axiosClient.put(`/admin/product-stores/${id}`, payload);

      alert("Cập nhật tồn kho thành công");
      router.push("/admin/product-store");
    } catch (e) {
      console.error(e);
      const data = e.response?.data;
      if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = data.errors[firstKey][0];
        setError(firstMsg);
      } else {
        setError(data?.message || e.message || "Lỗi khi cập nhật tồn kho");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  if (error) {
    return (
      <div>
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.push("/admin/product-store")}
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
          Sửa tồn kho #{store?.id}{" "}
          {store?.product?.name ? `- ${store.product.name}` : ""}
        </h2>
        <button
          onClick={() => router.push("/admin/product-store")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Sản phẩm</label>
          <div className="border rounded px-3 py-2 bg-gray-50">
            {store?.product ? (
              <div>
                <div className="font-semibold">{store.product.name}</div>
                <div className="text-xs text-gray-500">
                  #{store.product.id} – {store.product.slug}
                </div>
              </div>
            ) : (
              <div>Product ID: {store?.product_id}</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Giá nhập (price_root)
          </label>
          <input
            type="number"
            name="price_root"
            value={form.price_root}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Để trống = dùng giá sản phẩm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Số lượng (qty)</label>
          <input
            type="number"
            name="qty"
            min={0}
            value={form.qty}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
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
            <option value={1}>Hoạt động</option>
            <option value={0}>Không hoạt động</option>
          </select>
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/product-store")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
