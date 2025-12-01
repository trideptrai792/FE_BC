"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";

// Hàm lấy tất cả sản phẩm từ API
const getAllProducts = async () => {
  const res = await fetch("http://localhost:8000/api/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await res.json();
  return data.data; // Trả về danh sách tất cả sản phẩm
};

export default function Home() {
  const images = [
    "/banner/banner1.jpg",
    "/banner/banner2.jpg",
    "/banner/banner3.png",
  ];

  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timeoutRef = useRef(null);

  // Kiểm tra token để hiển thị Đăng nhập/Đăng xuất
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setIsLoggedIn(false);
  };

  // Fetch tất cả sản phẩm từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  const startAutoSlide = () => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const stopSlide = () => clearTimeout(timeoutRef.current);

  // Phân loại sản phẩm theo tên
  const categories = {
    "Whey Protein": [],
    "Mass Gainer": [],
    "Vitamin & Khoáng Chất": [],
    "Phục Hồi – BCAA": [],
    "Pre-workout": [],
  };

  products.forEach((product) => {
    const name = product.name?.toLowerCase() || "";
    if (name.includes("whey")) {
      categories["Whey Protein"].push(product);
    } else if (name.includes("mass")) {
      categories["Mass Gainer"].push(product);
    } else if (name.includes("vitamin")) {
      categories["Vitamin & Khoáng Chất"].push(product);
    } else if (name.includes("bcaa")) {
      categories["Phục Hồi – BCAA"].push(product);
    } else if (name.includes("pre-workout")) {
      categories["Pre-workout"].push(product);
    }
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-6">
      {/* THANH TRÊN: ĐĂNG NHẬP / ĐĂNG XUẤT */}
      <div className="w-full max-w-6xl flex justify-end mb-4 gap-3">
        {isLoggedIn ? (
          <>
            <span className="self-center text-sm md:text-base">
              Đã đăng nhập
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Đăng nhập
          </Link>
        )}
      </div>

      <h1 className="text-5xl font-bold mb-6">
        Cửa Hàng Thực Phẩm Bổ Sung chính hãng!
      </h1>

      <p className="text-xl max-w-xl text-center mb-8">
        Khám phá các sản phẩm thực phẩm bổ sung giúp cải thiện sức khỏe và nâng
        cao chất lượng cuộc sống!
      </p>

      {/* ======================== SLIDER ======================== */}
      <div
        className="relative w-full max-w-6xl mx-auto mt-6 overflow-hidden rounded-xl shadow-xl bg-black"
        onMouseEnter={stopSlide}
        onMouseLeave={startAutoSlide}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              className="w-full min-w-full h-[360px] object-cover"
              alt={`banner-${index}`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrent(current === 0 ? images.length - 1 : current - 1)
          }
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-80"
        >
          ❮
        </button>

        <button
          onClick={() => setCurrent((current + 1) % images.length)}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-80"
        >
          ❯
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                current === index ? "bg-white w-6" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ======================== WHEY PROTEIN ======================== */}
    {/* WHEY PROTEIN */}
<section
  id="whey"
  className="w-full max-w-6xl mt-10"
>
  <h2 className="text-3xl font-bold mb-4 text-left">
    Sản Phẩm Whey Protein
  </h2>

  <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories["Whey Protein"].map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
</section>

{/* MASS GAINER */}
<section
  id="mass"
  className="w-full max-w-6xl mt-10"
>
  <h2 className="text-3xl font-bold mb-4 text-left">
    Sản Phẩm Mass Gainer
  </h2>

  <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories["Mass Gainer"].map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
</section>

{/* VITAMIN */}
<section
  id="vitamin"
  className="w-full max-w-6xl mt-10"
>
  <h2 className="text-3xl font-bold mb-4 text-left">
    Sản Phẩm Vitamin & Khoáng Chất
  </h2>

  <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories["Vitamin & Khoáng Chất"].map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
</section>
    </main>
  );
}
