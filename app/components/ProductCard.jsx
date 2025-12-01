// app/components/ProductCard.jsx
"use client";

import Link from "next/link";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/noimage.png";
  return imagePath.startsWith("http")
    ? imagePath
    : `http://localhost:8000${imagePath}`;
};

export default function ProductCard({ product }) {
  const price =
    typeof product.price === "string"
      ? product.price
      : Number(product.price || 0).toLocaleString("vi-VN") + " đ";

  return (
    <div className="bg-white text-gray-900 rounded-2xl shadow-md border border-blue-100 card-hover flex flex-col">
      {/* Ảnh */}
      <div className="w-full h-56 flex items-center justify-center bg-white rounded-t-2xl">
        <img
          src={getImageUrl(product.thumbnail)}
          alt={product.name}
          className="max-h-full w-auto object-contain"
        />
      </div>

      {/* Nội dung */}
      <div className="flex-1 flex flex-col items-center px-4 py-4 text-center gap-2">
        <h3 className="text-lg font-semibold text-blue-900">
          {product.name}
        </h3>

        <p className="text-red-600 font-bold text-xl">{price}</p>

        <p className="text-sm text-gray-600 line-clamp-2">
          {product.content}
        </p>

        <div className="mt-3 flex gap-3 w-full">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm font-semibold">
            Mua ngay
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold text-center"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
