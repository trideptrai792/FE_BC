"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProductCard from "./components/ProductCard";
import FlashSaleSection from "./components/FlashSaleSection";

import { productService } from "./lib/productService";
const getAllProducts = async () => {
  const res = await axios.get("http://localhost:8000/api/products");
 
  return res.data.data || [];
};

export default function Home() {
  const images = [
    "/banner/banner1.jpg",
    "/banner/banner2.jpg",
    "/banner/banner3.png",
  ];

  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  const timeoutRef = useRef(null);

  // Fetch tất cả sản phẩm từ API
  useEffect(() => {
  const fetchData = async () => {
    try {
      const productsData = await productService.getAll();
      setProducts(productsData);
const newData = await productService.getNew(10);
setNewProducts(
  newData.map((p) => ({
    ...p,
    price_origin: p.price_origin ?? p.price ?? null,
    price_sale: p.price_sale ?? null,
    price_display: p.price_display ?? p.price_sale ?? p.price ?? 0,
    price: p.price_display ?? p.price_sale ?? p.price ?? 0,
  }))
);
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
    <main className="min-h-screen w-full bg-gray-50 text-gray-900 pb-12">
      {/* HERO + SLIDER */}
      <section className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            Cửa Hàng Thực Phẩm Bổ Sung Chính Hãng
          </h1>
          <p className="text-base md:text-xl max-w-2xl text-center mb-8 text-blue-50">
            Khám phá các sản phẩm thực phẩm bổ sung giúp cải thiện sức khỏe và
            nâng cao chất lượng cuộc sống!
          </p>

          {/* SLIDER */}
          <div
            className="relative w-full max-w-6xl mx-auto mt-4 overflow-hidden rounded-xl shadow-xl bg-black"
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
                  className="w-full min-w-full h-[260px] md:h-[360px] object-cover"
                  alt={`banner-${index}`}
                />
              ))}
            </div>

            {/* Prev */}
            <button
              onClick={() =>
                setCurrent(current === 0 ? images.length - 1 : current - 1)
              }
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70"
            >
              ❮
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrent((current + 1) % images.length)}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70"
            >
              ❯
            </button>

            {/* Indicators */}
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
        </div>
      </section>

      {/* FLASH SALE ngay dưới banner */}
      <FlashSaleSection />
      <section className="w-full max-w-6xl mx-auto mt-10 px-4 md:px-6">
  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">
    Sản Phẩm Mới
  </h2>

  <div className="bg-white rounded-3xl p-6 shadow-sm">
    {newProducts.length === 0 ? (
      <p className="text-gray-500 text-sm">Chưa có sản phẩm mới.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </div>
</section>

      {/* WHEY PROTEIN */}
      <section id="whey" className="w-full max-w-6xl mx-auto mt-10 px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">
          Sản Phẩm Whey Protein
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {categories["Whey Protein"].length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có sản phẩm.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories["Whey Protein"].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MASS GAINER */}
      <section id="mass" className="w-full max-w-6xl mx-auto mt-10 px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">
          Sản Phẩm Mass Gainer
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {categories["Mass Gainer"].length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có sản phẩm.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories["Mass Gainer"].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VITAMIN & KHOÁNG CHẤT */}
      <section
        id="vitamin"
        className="w-full max-w-6xl mx-auto mt-10 px-4 md:px-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">
          Sản Phẩm Vitamin & Khoáng Chất
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {categories["Vitamin & Khoáng Chất"].length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có sản phẩm.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories["Vitamin & Khoáng Chất"].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
