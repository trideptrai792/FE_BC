"use client";

import { useEffect, useState } from "react";
import { productService } from "../../lib/productService"; // đi lên 2 cấp
import ProductCard from "../../components/ProductCard";

function getCategoryTitleAndDesc(slug) {
  switch (slug) {
    case "whey-protein":
      return {
        title: "Whey Protein",
        desc: "Các sản phẩm Whey Protein hỗ trợ tăng cơ và phục hồi sau tập.",
      };
    case "mass-gainer":
      return {
        title: "Mass Gainer",
        desc: "Các sản phẩm Mass Gainer giúp tăng cân, tăng cơ cho người khó tăng cân.",
      };
    case "vitamin-khoang":
    case "vitamin-khoang-chat":
      return {
        title: "Vitamin & Khoáng Chất",
        desc: "Nhóm sản phẩm vitamin và khoáng chất giúp tăng cường sức khỏe tổng thể.",
      };
    default:
      return {
        title: slug || "Danh mục sản phẩm",
        desc: "Danh sách sản phẩm thuộc danh mục.",
      };
  }
}

export default function CategoryPage({ params }) {
  const raw = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent((raw || "").toLowerCase());

  const { title, desc } = getCategoryTitleAndDesc(slug);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // GỌI API BẰNG AXIOS QUA productService
        const list = await productService.getByCategorySlug(slug);
        setProducts(list);
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
        {/* BREADCRUMB */}
        <p className="text-sm text-gray-500 mb-3">
          <span>Trang chủ</span> / <span>Danh mục</span> /{" "}
          <span className="font-semibold">{title}</span>
        </p>

        {/* TIÊU ĐỀ */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Danh mục: {title}
        </h1>
        <p className="text-sm md:text-base text-gray-600 mb-6">{desc}</p>

        {/* NỘI DUNG */}
        {loading ? (
          <p className="text-sm text-gray-600">Đang tải sản phẩm...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">
            Danh mục này chưa có sản phẩm.
          </p>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
