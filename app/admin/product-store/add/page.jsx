"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "../../../lib/axiosClient"; // từ app/admin/product-store/add

const emptyForm = {
  product_id: "",
  price_root: "",
  qty: "",
  status: 1,
};

export default function AdminProductStoreAddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Nếu có ?product_id=... trên URL thì prefill
  useEffect(() => {
    const pid = searchParams.get("product_id");
    if (pid) {
      setForm((prev) => ({ ...prev, product_id: pid }));
    }
  }, [searchParams]);

  // Lấy danh sách sản phẩm để chọn
  useEffect(() => {
    axiosClient
      .get("/products")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setProducts(data);
      })
      .catch((e) => {
        console.error(e);
        setError(e.message || "Không tải được danh sách sản phẩm");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        product_id: Number(form.product_id),
        price_root:
          form.price_root === "" ? undefined : Number(form.price_root),
        qty: Number(form.qty),
        status: Number(form.status),
      };

      await axiosClient.post("/admin/product-stores", payload);

      alert("Tạo tồn kho thành công");
      router.push(
        form.product_id
          ? `/admin/product-store?product_id=${form.product_id}`
          : "/admin/product-store"
      );
    } catch (e) {
      console.error(e);
      const data = e.response?.data;
      if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = data.errors[firstKey][0];
        setError(firstMsg);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError(e.message || "Lỗi khi tạo tồn kho");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Thêm tồn kho sản phẩm</h2>
        <button
          onClick={() => router.push("/admin/product-store")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Sản phẩm
          </label>
          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          >
            <option value="">-- chọn sản phẩm --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} - {p.name}
              </option>
            ))}
          </select>
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
            placeholder="Để trống = dùng price_buy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Số lượng (qty)
          </label>
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
          <label className="block text-sm font-medium mb-1">
            Trạng thái
          </label>
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu tồn kho"}
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
