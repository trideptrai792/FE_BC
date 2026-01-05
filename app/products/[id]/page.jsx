"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function ProductDetail() {
  const params = useParams();
  const slug = params?.id; // [id] => params.id
const [adding, setAdding] = useState(false);
const [addMsg, setAddMsg] = useState("");
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [related, setRelated] = useState([]);


  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Lấy chi tiết sản phẩm bằng axios
        const res = await axios.get(`${API_BASE}/api/products/${slug}`);
        const json = res.data;
        const p = json.data ?? json;

        // 1.1 Gộp thumbnail + images thành mảng, rồi loại trùng
        const imgList = [];

        if (p.thumbnail) {
          imgList.push(p.thumbnail); // thường là URL đầy đủ
        }

        if (Array.isArray(p.images)) {
          p.images.forEach((img) => {
            if (img && img.image) {
              const url = img.image.startsWith("http")
                ? img.image
                : `${API_BASE}${img.image}`;
              imgList.push(url);
            }
          });
        }

        const dedupImages = Array.from(new Set(imgList));

        // merged giữ nguyên mọi field từ BE, bao gồm cả attributes
        const merged = {
          ...p,
          images: dedupImages.length > 0 ? dedupImages : ["/images/noimage.png"],
        };

        setProduct(merged);
        setMainImage(merged.images[0]);

        // 2. Lấy danh sách tất cả sản phẩm để chọn 3 sản phẩm liên quan ngẫu nhiên
        try {
          const resAll = await axios.get(`${API_BASE}/api/products`);
          const jsonAll = resAll.data;
          const list = jsonAll.data ?? [];

          const others = list.filter((item) => item.id !== merged.id);
          const shuffled = [...others].sort(() => 0.5 - Math.random());
          setRelated(shuffled.slice(0, 3));
        } catch (err2) {
          console.error("Lỗi load related products:", err2);
        }
      } catch (err) {
        console.error(err);
        setError("Không tải được thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleAddToCart = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    router.push("/login");
    return;
  }

  if (typeof product?.stock === "number" && product.stock <= 0) {
    setAddMsg("Sản phẩm đã hết hàng.");
    return;
  }

  try {
    setAdding(true);
    setAddMsg("");

    await axios.post(
      `${API_BASE}/api/cart/items`,
      {
        product_id: product.id,
        qty: 1,
        variant: {}, // nếu có chọn size/màu thì truyền vào đây
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setAddMsg("Đã thêm vào giỏ hàng.");
    // muốn chuyển sang trang giỏ hàng thì mở dòng dưới
    // router.push("/cart");
  } catch (e) {
    setAddMsg("Thêm vào giỏ thất bại.");
  } finally {
    setAdding(false);
  }
};

  if (loading || !slug) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <p>Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <p className="text-red-600">{error || "Không tìm thấy sản phẩm"}</p>
      </div>
    );
  }
const priceDisplay = product.price_display ?? product.price;
const priceOrigin = product.price_origin ?? product.price;
  const shortDesc =
    product.content ||
    "Sản phẩm chất lượng cao, đang cập nhật mô tả chi tiết.";
  const benefit =
    product.benefit || "Đang cập nhật công dụng chi tiết cho sản phẩm này.";
  const usage =
    product.usage ||
    "Đang cập nhật hướng dẫn sử dụng. Vui lòng xem trên bao bì sản phẩm.";

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      {/* BREADCRUMB */}
      <p className="text-gray-600 mb-4">
        Trang Chủ / Sản Phẩm /{" "}
        <span className="font-semibold">{product.name}</span>
      </p>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <img
            src={mainImage}
            className="w-full h-[420px] object-contain rounded-lg border shadow"
            alt={product.name}
          />

          <div className="flex gap-3 mt-4">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setMainImage(img)}
                className={`w-24 h-24 object-contain cursor-pointer rounded border p-1 
                ${mainImage === img ? "border-red-600" : "border-gray-300"
                  }`}
                alt={product.name}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

       <p className="text-2xl text-red-600 font-bold mb-2">
  ₫{Number(priceDisplay).toLocaleString("vi-VN")}
</p>
{priceDisplay !== priceOrigin && (
  <p className="text-base text-gray-400 line-through mb-4">
    ₫{Number(priceOrigin).toLocaleString("vi-VN")}
  </p>
)}

          <div className="flex items-center mb-4">
            <span className="text-yellow-500 text-xl">★★★★★</span>
            <span className="text-gray-500 ml-2">(128 đánh giá)</span>
          </div>

       {product.product_attributes?.length > 0 && (
  <div className="mt-4">
    <h4 className="font-semibold mb-2">Thuộc tính</h4>
    <ul className="space-y-1 text-sm text-gray-700">
      {product.product_attributes.map((attr) => (
        <li key={attr.id}>
          <span className="font-medium">
            {attr.attribute_name || `Thuộc tính ${attr.attribute_id}`}:
          </span>{" "}
          {attr.value}
        </li>
      ))}
    </ul>
  </div>
)}
{/* Tồn kho */}
<div className="mb-4 text-sm text-gray-700">
  {typeof product.stock === "number" && product.stock > 0 ? (
    <span className="text-green-600 font-semibold">
      Còn {product.stock} sản phẩm
    </span>
  ) : (
    <span className="text-red-600 font-semibold">Hết hàng</span>
  )}
</div>


          <p className="text-gray-700 text-lg mb-6">{shortDesc}</p>
<button
  onClick={handleAddToCart}
  disabled={adding || (typeof product.stock === "number" && product.stock <= 0)}
  className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-red-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
>
  {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
</button>

{addMsg && <p className="mt-3 text-sm text-gray-700">{addMsg}</p>}

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Công Dụng</h2>
            <p className="text-gray-700 mb-4">{benefit}</p>

            <h2 className="text-xl font-semibold mb-2">Hướng Dẫn Sử Dụng</h2>
            <p className="text-gray-700 mb-4">{usage}</p>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Sản Phẩm Liên Quan</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-lg shadow p-4 hover:shadow-xl transition"
            >
              <img
                src={item.thumbnail ? item.thumbnail : "/images/noimage.png"}
                className="w-full h-48 object-contain"
                alt={item.name}
              />
              <h3 className="font-semibold text-lg mt-3">{item.name}</h3>
              <p className="text-red-600 font-bold mt-2">₫{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
