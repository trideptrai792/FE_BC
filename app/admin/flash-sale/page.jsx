"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8000/api";

const emptyForm = {
    id: null,
    product_id: "",
    flash_price: "",
    discount_percent: "",
    end_at: "",
};

export default function FlashSaleAdminPage() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const getHeaders = () => {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
    };

    // Lấy danh sách sản phẩm để chọn
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/products`);
            const json = await res.json();
            setProducts(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Lỗi tải products:", err);
        }
    };

    // Lấy danh sách flash sale (admin)
    const fetchFlashSales = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE}/admin/flash-sales`, {
                headers: getHeaders(),
            });
            const json = await res.json();
            setItems(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách Flash Sale");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchFlashSales();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = (item) => {
        setForm({
            id: item.id,
            product_id: item.product_id ?? "",
            flash_price: item.flash_price ?? "",
            discount_percent: item.discount_percent ?? "",
            end_at: item.end_at
                ? item.end_at.slice(0, 19).replace("Z", "") // 2025-12-30T05:31:46Z → 2025-12-30T05:31:46
                : "",
        });
        setIsEditing(true);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            if (!form.product_id) {
                setError("Vui lòng chọn sản phẩm");
                setSaving(false);
                return;
            }
            if (!form.flash_price) {
                setError("Vui lòng nhập giá Flash Sale");
                setSaving(false);
                return;
            }
            if (!form.end_at) {
                setError("Vui lòng chọn thời gian kết thúc Flash Sale");
                setSaving(false);
                return;
            }

            const discountPercent = form.discount_percent
                ? Number(form.discount_percent)
                : null;

            const payload = {
                product_id: Number(form.product_id),
                flash_price: Number(form.flash_price),
                discount_percent: discountPercent,
                sold: 0,
                // label mặc định từ % giảm
                discount_label: discountPercent ? `Giảm ${discountPercent}%` : null,
                badge_left: "FREESHIP",
                badge_right: "TẶNG QUÀ",
                benefit_1: "",
                benefit_2: "",
                start_at: null, // hoặc gửi form.start_at nếu có
                end_at: form.end_at,
                status: 1,
                sort_order: 0,
            };

            const url = isEditing
                ? `${API_BASE}/admin/flash-sales/${form.id}`
                : `${API_BASE}/admin/flash-sales`;
            const method = isEditing ? "PUT" : "POST";

            console.log("FLASH_SALE payload gửi lên =", payload);

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            let data = null;
            try {
                data = await res.json();
            } catch (e) {
                // response không phải json
            }

            if (!res.ok) {
                console.error(
                    "FLASH_SALE error:",
                    res.status,
                    data || (await res.text().catch(() => null))
                );
                setError(
                    data?.message ||
                    (data?.errors
                        ? JSON.stringify(data.errors)
                        : `Lưu Flash Sale thất bại (HTTP ${res.status})`)
                );
                setSaving(false);
                return;
            }

            // Lưu OK → reload list + reset form
            await fetchFlashSales();
            resetForm();
        } catch (err) {
            console.error("FLASH_SALE exception:", err);
            setError(err.message || "Lỗi không xác định khi lưu Flash Sale");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa mục Flash Sale này?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/flash-sales/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Xóa thất bại");
            }
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // Lấy thông tin sản phẩm đang chọn (để hiển thị giá gốc, tên)
    const selectedProduct = useMemo(
        () =>
            products.find((p) => String(p.id) === String(form.product_id)) || null,
        [products, form.product_id]
    );

    return (
        <div className="max-w-6xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý Flash Sale</h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* FORM THÊM / SỬA */}
            <form
                onSubmit={handleSubmit}
                className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl shadow-sm p-4"
            >
                {/* Chọn sản phẩm từ danh sách */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">
                        Chọn sản phẩm
                    </label>
                    <select
                        name="product_id"
                        value={form.product_id}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                #{p.id} - {p.name}
                            </option>
                        ))}
                    </select>

                    {/* Hiển thị thông tin sản phẩm đã chọn */}
                    {selectedProduct && (
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
                            {selectedProduct.thumbnail && (
                                <img
                                    src={selectedProduct.thumbnail}
                                    alt={selectedProduct.name}
                                    className="w-12 h-12 object-contain border rounded"
                                />
                            )}
                            <div>
                                <div className="font-semibold">{selectedProduct.name}</div>
                                {selectedProduct.price && (
                                    <div className="text-xs text-gray-500">
                                        Giá gốc: {selectedProduct.price}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Giá Flash Sale */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Giá Flash Sale
                    </label>
                    <input
                        type="number"
                        name="flash_price"
                        value={form.flash_price}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Ví dụ: 850000"
                    />
                </div>

                {/* % giảm giá */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        % giảm giá (discount_percent)
                    </label>
                    <input
                        type="number"
                        name="discount_percent"
                        value={form.discount_percent}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Ví dụ: 45"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Nếu nhập, BE sẽ tạo nhãn ví dụ: &quot;Giảm 45%&quot;.
                    </p>
                </div>

                {/* Thời gian kết thúc */}
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Thời gian kết thúc Flash Sale
                    </label>
                    <input
                        type="datetime-local"
                        name="end_at"
                        value={form.end_at}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                {/* Xem nhanh giá sau khi giảm (tính trên FE) */}
                {selectedProduct && form.flash_price && (
                    <div className="md:col-span-2 text-sm text-gray-700 mt-2">
                        <div>
                            Giá gốc:{" "}
                            <span className="font-semibold">
                                {selectedProduct.price || "(chưa rõ định dạng)"}
                            </span>
                        </div>
                        <div>
                            Giá Flash Sale:{" "}
                            <span className="font-semibold">{form.flash_price}</span>
                        </div>
                        {form.discount_percent && (
                            <div>
                                Label hiển thị:{" "}
                                <span className="font-semibold">
                                    Giảm {form.discount_percent}%
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 rounded-lg border text-sm"
                        >
                            Hủy chỉnh sửa
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
                    >
                        {saving
                            ? "Đang lưu..."
                            : isEditing
                                ? "Cập nhật Flash Sale"
                                : "Thêm Flash Sale"}
                    </button>
                </div>
            </form>

            {/* DANH SÁCH FLASH SALE */}
            <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">
                    Danh sách sản phẩm Flash Sale
                </h2>
                {loading ? (
                    <p className="text-sm text-gray-500">Đang tải...</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có sản phẩm Flash Sale.</p>
                ) : (
                    <table className="min-w-full text-sm border-t">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-2 py-2 text-left">ID</th>
                                <th className="px-2 py-2 text-left">Sản phẩm</th>
                                <th className="px-2 py-2 text-left">Giá Flash Sale</th>
                                <th className="px-2 py-2 text-left">% Giảm</th>
                                <th className="px-2 py-2 text-left">Kết thúc</th>
                                <th className="px-2 py-2 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.id} className="border-t">
                                    <td className="px-2 py-2">{it.id}</td>
                                    <td className="px-2 py-2 max-w-xs truncate">
                                        #{it.product_id} - {it.product_name}
                                    </td>
                                    <td className="px-2 py-2">{it.flash_price}</td>
                                    <td className="px-2 py-2">{it.discount_percent ?? "-"}</td>
                                    <td className="px-2 py-2 text-xs">
                                        {it.end_at
                                            ? it.end_at.replace("T", " ").replace("Z", "")
                                            : ""}
                                    </td>
                                    <td className="px-2 py-2 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(it)}
                                            className="px-3 py-1 rounded-lg border text-xs hover:bg-gray-50"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(it.id)}
                                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
