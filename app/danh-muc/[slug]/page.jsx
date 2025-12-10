
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import ProductCard from "../../components/ProductCard";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug
    ? decodeURIComponent(params.slug.toString().toLowerCase())
    : "";

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
        const res = await axiosClient.get("/products", { params: { category: slug } });
        const list = res.data?.data || [];
        setProducts(list);
        setTitle(`Danh mục: ${slug}`);
      } catch (e) {
        console.error(e);
        setError("Không tải được sản phẩm cho danh mục này.");
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
          Trang chủ / Danh mục: <span className="font-semibold">{title}</span>
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
