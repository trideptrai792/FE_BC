"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import ProductCard from "../../components/ProductCard";

export default function CategoryPage() {
  const params = useParams();

  const slug = useMemo(() => {
    const raw = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    return raw ? decodeURIComponent(String(raw).trim()) : "";
  }, [params]);

  const [title, setTitle] = useState("Danh mục");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Không có slug danh mục.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const catRes = await axiosClient.get(`/categories/${encodeURIComponent(slug)}`);
        const category = catRes.data?.data || catRes.data;
        if (!category) {
          setError("Danh mục không tồn tại.");
          setProducts([]);
          setTitle("Danh mục");
          return;
        }

        setTitle(category.name || `Danh mục: ${slug}`);

        const prodRes = await axiosClient.get("/products", {
          params: { category: slug },
        });

        setProducts(prodRes.data?.data || []);
      } catch (e) {
        const msg =
          e.response?.status === 404
            ? "Danh mục không tồn tại (slug không đúng)."
            : e.response?.data?.message || e.message || "Không tải được dữ liệu.";
        setError(msg);
        setProducts([]);
        setTitle("Danh mục");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  return (
    <main className="min-h-screen w-full bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <p className="text-sm text-gray-500 mb-3">
          Trang chủ / <span className="font-semibold">{title}</span>
        </p>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{title}</h1>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p>Danh mục này chưa có sản phẩm.</p>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
