"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../../../lib/axiosClient";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  thumbnail: "",
  content: "",
  category_id: "",
  status: 1,
};

export default function AdminProductAddPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // NEW: danh sách attribute + lựa chọn của user
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    axiosClient
      .get("/attributes")
      .then((res) => {
        // Tùy BE: {data: [...]} hoặc [...]
        const data = res.data?.data || res.data || [];
        setAttributes(data);
      })
      .catch((err) => {
        console.error("Lỗi khi load attributes", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosClient.post("/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      setForm((prev) => ({
        ...prev,
        thumbnail: data.url,
      }));

      alert("Upload ảnh thành công");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi upload ảnh"
      );
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      stock: form.stock ? Number(form.stock) : 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      status: Number(form.status),
    };

    // 1. Tạo sản phẩm
    const productRes = await axiosClient.post("/products", payload);
    const productData = productRes.data?.data || productRes.data || {};
    const productId = productData.id;

    if (!productId) {
      throw new Error("Không lấy được ID sản phẩm");
    }

    // (Tuỳ bạn: nếu vẫn cần variant thì giữ đoạn tạo variant, nếu không cần thì có thể bỏ hoàn toàn)
    // const variantRes = await axiosClient.post("/product-variants", {...});
    // ...

    // 2. Gán thuộc tính cho product qua /product-attributes
    for (const [attrId, valueId] of Object.entries(selectedAttributes)) {
      if (!valueId) continue;

      // Tìm text value tương ứng từ `attributes` đang có trên FE
      const attr = attributes.find((a) => a.id === Number(attrId));
      const val =
        (attr?.values || []).find((v) => v.id === Number(valueId)) || null;

      const textValue = val?.value || "";

      if (!textValue) continue; // tránh gửi rỗng, sẽ fail validate

      await axiosClient.post("/product-attributes", {
        product_id: productId,
        attribute_id: Number(attrId),
        value: textValue,
      });
    }

    alert("Thêm sản phẩm + thuộc tính thành công");
    router.push("/admin/product");
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
      setError(e.message || "Lỗi khi thêm sản phẩm");
    }
  }
};

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
        <button
          onClick={() => router.push("/admin/product")}
          className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Quay lại danh sách
        </button>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Nếu để trống BE sẽ tự tạo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giá</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Ví dụ: 1250000"
          />
        </div>
        <div>
  <label className="block text-sm font-medium mb-1">Tồn kho</label>
  <input
    type="number"
    name="stock"
    min={0}
    value={form.stock}
    onChange={handleChange}
    className="w-full border rounded px-2 py-1"
    placeholder="Ví dụ: 10"
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

          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailFileChange}
            className="w-full text-sm"
          />

          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="Preview thumbnail"
              className="mt-2 w-24 h-24 object-contain border"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Category ID
          </label>
          <input
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Ví dụ: 1"
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
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>

        {/* NEW: chọn attribute/value */}
        {attributes.length > 0 && (
          <div className="md:col-span-2 border rounded p-3 space-y-3">
            <p className="text-sm font-semibold mb-1">
              Thuộc tính sản phẩm
            </p>
            {attributes.map((attr) => (
              <div key={attr.id}>
                <label className="block text-sm font-medium mb-1">
                  {attr.name}
                </label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedAttributes[attr.id] || ""}
                  onChange={(e) =>
                    setSelectedAttributes((prev) => ({
                      ...prev,
                      [attr.id]: e.target.value
                        ? Number(e.target.value)
                        : "",
                    }))
                  }
                >
                  <option value="">-- chọn --</option>
                  {(attr.values || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Lưu sản phẩm
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/product")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
