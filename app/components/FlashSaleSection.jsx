"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function formatDiff(endTime) {
  if (!endTime) return { d: "00", h: "00", m: "00", s: "00" };
  const end = new Date(endTime).getTime();
  const now = Date.now();
  let diff = Math.max(0, end - now);

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= d * 1000 * 60 * 60 * 24;
  const h = Math.floor(diff / (1000 * 60 * 60));
  diff -= h * 1000 * 60 * 60;
  const m = Math.floor(diff / (1000 * 60));
  diff -= m * 1000 * 60;
  const s = Math.floor(diff / 1000);

  const pad = (x) => x.toString().padStart(2, "0");
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

const parseVnPrice = (str) => {
  if (!str) return null;
  const numeric = str.replace(/[^\d]/g, "");
  if (!numeric) return null;
  return Number(numeric);
};

export default function FlashSaleSection() {
  const [products, setProducts] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(formatDiff(null));
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchFlash = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/flash-sale", {
          cache: "no-store",
        });
        const json = await res.json();

        const items = json.data || [];
        setProducts(Array.isArray(items) ? items : []);

        // lấy end_time từ item đầu tiên
        const end = items.length > 0 ? items[0].end_time : null;
        setEndTime(end);
        setTimeLeft(formatDiff(end));
      } catch (err) {
        console.error("Error fetch flash sale:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlash();
  }, []);

  // countdown
  useEffect(() => {
    if (!endTime) return;
    const id = setInterval(() => {
      setTimeLeft(formatDiff(endTime));
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const scrollRight = () => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  if (!products.length && !loading) return null;

  return (
    <section className="w-full bg-[#ff5722] mt-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="bg-[#ff5722] rounded-3xl shadow-lg p-4 md:p-5 text-white relative overflow-hidden">
          {/* HEADER: FLASH SALE + countdown */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold leading-snug">
                  FLASH SALE
                </h2>
                <p className="text-sm md:text-base text-yellow-200">
                  Kết thúc sau
                </p>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <div className="flex flex-col items-center bg-white text-[#ff5722] rounded-lg px-2 py-1 min-w-[50px]">
                  <span className="text-base md:text-lg font-bold">
                    {timeLeft.d}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold">
                    ngày
                  </span>
                </div>
                <div className="flex flex-col items-center bg-white text-[#ff5722] rounded-lg px-2 py-1 min-w-[50px]">
                  <span className="text-base md:text-lg font-bold">
                    {timeLeft.h}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold">
                    giờ
                  </span>
                </div>
                <div className="flex flex-col items-center bg-white text-[#ff5722] rounded-lg px-2 py-1 min-w-[50px]">
                  <span className="text-base md:text-lg font-bold">
                    {timeLeft.m}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold">
                    phút
                  </span>
                </div>
                <div className="flex flex-col items-center bg-white text-[#ff5722] rounded-lg px-2 py-1 min-w-[50px]">
                  <span className="text-base md:text-lg font-bold">
                    {timeLeft.s}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold">
                    giây
                  </span>
                </div>
              </div>
            </div>

            {/* Tab giả: chỉ hiển thị, chưa tách dữ liệu */}
            <div className="flex items-end gap-6 text-sm md:text-base font-semibold">
              <span className="pb-1 border-b-4 border-white">SALE RẺ NHẤT</span>
              <span className="pb-1 border-b-4 border-transparent opacity-80">
                HÀNG THANH LÝ
              </span>
            </div>
          </div>

          {/* LIST SẢN PHẨM NGANG */}
          <div className="relative">
            <div
              ref={listRef}
              className="flex gap-4 overflow-x-auto pb-3 pr-10 scroll-smooth"
            >
              {products.map((p) => {
                const priceNum = parseVnPrice(p.price);
                const oldPriceNum = parseVnPrice(p.old_price);
                let discountText = p.discount_label;

                if (!discountText && priceNum && oldPriceNum && oldPriceNum > priceNum) {
                  const disc = Math.round(
                    100 - (priceNum / oldPriceNum) * 100
                  );
                  discountText = `Giảm ${disc}%`;
                }

                const href = p.slug
                  ? `/products/${p.slug}`
                  : `/products/${p.product_id}`;

                return (
                  <div
                    key={p.id}
                    className="min-w-[220px] max-w-[240px] bg-white text-gray-900 rounded-3xl overflow-hidden shadow-md flex-shrink-0"
                  >
                    {/* ẢNH + BADGE */}
                    <div className="relative bg-white">
                      <Link href={href}>
                        <div className="aspect-[4/5] flex items-center justify-center bg-white">
                          <img
                            src={p.thumbnail || "/images/noimage.png"}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </Link>

                      {discountText && (
                        <div className="absolute top-2 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-full">
                          {discountText}
                        </div>
                      )}

                      <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 shadow">
                        <i className="fa-regular fa-heart text-sm" />
                      </button>

                      {/* NHÃN DƯỚI ẢNH */}
                      <div className="flex text-[11px] font-semibold text-white">
                        <div className="flex-1 bg-red-600 text-center py-1">
                          {p.badge_left || "FREESHIP"}
                        </div>
                        <div className="flex-1 bg-black text-center py-1">
                          {p.badge_right || "TẶNG QUÀ"}
                        </div>
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="px-3 pt-3 pb-4">
                      <Link
                        href={href}
                        className="block text-sm font-semibold line-clamp-2 mb-1 hover:text-red-600"
                      >
                        {p.name}
                      </Link>

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-base font-bold text-red-600">
                          {p.price}
                        </span>
                        {p.old_price && (
                          <span className="text-xs line-through text-gray-400">
                            {p.old_price}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600 mb-2">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <i className="fa-solid fa-star" />
                          <i className="fa-solid fa-star" />
                          <i className="fa-solid fa-star" />
                          <i className="fa-solid fa-star" />
                          <i className="fa-solid fa-star" />
                        </div>
                        <span>{p.sold || ""}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="bg-gray-100 rounded-xl px-2 py-1 text-[11px]">
                          {p.benefit_1 || "Miễn phí giao hàng"}
                        </div>
                        <div className="bg-gray-100 rounded-xl px-2 py-1 text-[11px]">
                          {p.benefit_2 || "Ưu đãi sốc hôm nay"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NÚT NEXT BÊN PHẢI */}
            <button
              type="button"
              onClick={scrollRight}
              className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-white text-gray-800 shadow-lg items-center justify-center"
            >
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
          </div>

          {/* NÚT XEM TẤT CẢ */}
          <div className="flex justify-center mt-3">
            <Link
              href="/#whey"
              className="bg-white text-[#ff5722] px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
