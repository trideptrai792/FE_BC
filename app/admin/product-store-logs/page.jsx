"use client";

import { useEffect, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import Link from "next/link";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function AdminProductStoreLogsPage() {
    const [logs, setLogs] = useState([]);
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        const res = await axiosClient.get("/products");
        setProducts(res.data?.data || res.data || []);
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axiosClient.get("/admin/product-store-logs", {
                params: {
                    product_id: productId || undefined,
                    type: type || undefined,
                },
            });

            setLogs(res.data?.data || []);
        } catch (e) {
            setError(e.response?.data?.message || e.message || "Lỗi tải lịch sử tồn kho");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchProducts(), fetchLogs()]);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [productId, type]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Lịch sử tồn kho</h2>

                <div className="flex gap-2">
                    <Link
                        href="/admin/product-stores"
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Tồn kho
                    </Link>
                </div>
            </div>

            {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

            {/* Filter */}
            <div className="bg-white border rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                    <label className="block font-medium mb-1">Sản phẩm</label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- tất cả --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                #{p.id} - {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium mb-1">Loại</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- tất cả --</option>
                        <option value="import">Nhập kho</option>
                        <option value="export">Xuất kho</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="w-full bg-white rounded shadow text-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Sản phẩm</th>
                            <th className="p-2 text-left">Thumbnail</th>
                            <th className="p-2 text-left">Loại</th>
                            <th className="p-2 text-left">Số lượng</th>
                            <th className="p-2 text-left">Ghi chú</th>
                            <th className="p-2 text-left">Thời gian</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.map((l) => (
                            <tr key={l.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">#{l.id}</td>

                                <td className="p-2">{l.product?.name || `#${l.product_id}`}</td>

                                <td className="p-2">
                                    {l.product_thumbnail ? (
                                        <img
                                            src={l.product_thumbnail}
                                            alt=""
                                            className="w-10 h-10 object-contain border rounded"
                                        />
                                    ) : (
                                        "-"
                                    )}
                                </td>

                                <td className="p-2">
                                    {l.type === "import" ? "Nhập" : l.type === "export" ? "Xuất" : l.type}
                                </td>

                                <td className="p-2">{fmt(l.qty)}</td>
                                <td className="p-2">{l.note || "-"}</td>
                                <td className="p-2">{String(l.created_at || "")}</td>
                            </tr>
                        ))}

                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    Chưa có lịch sử
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            )}
        </div>
    );
}
