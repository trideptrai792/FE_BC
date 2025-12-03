"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Input,
  Button,
} from "@heroui/react";
import Link from "next/link";

const coupons = [
  {
    code: "OSTROVIT05",
    desc: "Giam 5K cho don hang >= 500K",
    expiry: "HSD: 31/12/2025",
  },
  {
    code: "OSTROVIT20",
    desc: "Giam 20K cho don hang >= 1.000K",
    expiry: "HSD: 31/12/2025",
  },
  {
    code: "OSTROVIT50",
    desc: "Giam 50K cho don hang >= 2.000K",
    expiry: "HSD: 31/12/2025",
  },
];

export default function Header() {
  const router = useRouter();
 const [userName, setUserName] = useState(null);
const pathname = usePathname();

// Đọc lại auth mỗi khi đổi route + khi có event "auth-changed"


useEffect(() => {
  if (typeof window === "undefined") return;

  const syncAuth = () => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("displayName");
    if (token && name) {
      setUserName(name);
    } else {
      setUserName(null);
    }
  };

  // chạy ngay lần đầu
  syncAuth();

  // nghe event login/logout
  window.addEventListener("auth-changed", syncAuth);

  // cleanup
  return () => {
    window.removeEventListener("auth-changed", syncAuth);
  };
}, [pathname]);


const handleLogout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("displayName");
  setUserName(null);
  // báo cho các component khác (Header) biết auth đã đổi
  window.dispatchEvent(new Event("auth-changed"));
  router.push("/login");
};

  const copyCode = async (code) => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const temp = document.createElement("textarea");
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      alert(`Da sao chep ma: ${code}`);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Khong sao chep duoc. Thu lai sau.");
    }
  };

  return (
    <>
      {/* ========== TOP BLACK BAR ========== */}
      <div className="w-full bg-black text-white text-xs sm:text-sm py-2 px-4 sm:px-6 flex justify-between items-center">
        <span className="font-medium tracking-wide">
          100% HÀNG CHÍNH HÃNG
        </span>
        <span className="hidden sm:inline font-medium tracking-wide">
          GIAO HÀNG TOÀN QUỐC
        </span>
      </div>

      {/* ========== MAIN HEADER (HeroUI Navbar) ========== */}
      <Navbar
        maxWidth="xl"
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        {/* LOGO + BRAND */}
        <NavbarBrand className="gap-3">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              className="h-10 w-auto md:h-12"
              alt="Logo"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.15em] text-red-600 font-semibold">
                OstroVit Viet Nam
              </span>
              <span className="text-lg md:text-2xl font-bold text-black">
                E-Commerce Shop
              </span>
            </div>
          </Link>
        </NavbarBrand>

        {/* SEARCH BAR */}
        <NavbarContent className="flex-1 justify-center px-2 md:px-6 hidden md:flex">
          <Input
            aria-label="Tìm kiếm sản phẩm"
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
            radius="sm"
            size="sm"
            className="max-w-xl"
            classNames={{
              inputWrapper:
                "bg-gray-50 border border-gray-200 shadow-none focus-within:border-red-500",
              input: "text-sm",
            }}
            startContent={
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm" />
            }
          />
        </NavbarContent>

        {/* ICONS + ACCOUNT + LOGIN/LOGOUT */}
        <NavbarContent justify="end" className="gap-3 md:gap-4">
          <NavbarItem className="hidden md:flex flex-col items-end text-xs leading-tight text-gray-600">
            <span className="font-semibold text-gray-800">
              Hotline: <span className="text-red-600">1900 888 999</span>
            </span>
            <span>Tư vấn miễn phí 8h00 - 22h00</span>
          </NavbarItem>

          <NavbarItem className="flex items-center gap-4 text-lg text-black">
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-phone" />
            </button>

            {/* Tài khoản / Xin chào tên user */}
            {userName ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-gray-700"
              >
                <i className="fa-solid fa-user" />
                <span className="hidden sm:inline">
                  Xin chào, <span className="font-semibold">{userName}</span>
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition"
              >
                <i className="fa-solid fa-user" />
                <span className="hidden sm:inline">Tài khoản</span>
              </Link>
            )}

            <button
              type="button"
              className="relative inline-flex items-center text-sm text-gray-700 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-cart-shopping" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center">
                0
              </span>
            </button>
          </NavbarItem>

          <NavbarItem className="hidden sm:flex">
            {userName ? (
              <Button
                size="sm"
                radius="full"
                variant="bordered"
                className="border-red-500 text-red-600 font-semibold"
                onPress={handleLogout}
              >
                Đăng xuất
              </Button>
            ) : (
              <Button
                as={Link}
                href="/login"
                size="sm"
                radius="full"
                className="bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-4"
              >
                Đăng nhập
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* ========== RED MENU BAR ========== */}
      <nav className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-md">
  <div className="max-w-6xl mx-auto px-4">
    <div className="flex flex-wrap items-center gap-3 py-3 text-sm md:text-base">
      <Button
        as={Link}
        href="/#whey"
        variant="flat"
        radius="full"
        size="sm"
        className="bg-white/10 text-white font-semibold hover:bg-white/20 
                   data-[hover=true]:scale-[1.02] transition-transform"
      >
        Whey Protein
      </Button>

      <Button
        as={Link}
        href="/#mass"
        variant="flat"
        radius="full"
        size="sm"
        className="bg-white/10 text-white font-semibold hover:bg-white/20 
                   data-[hover=true]:scale-[1.02] transition-transform"
      >
        Mass Gainer
      </Button>

      <Button
        as={Link}
        href="/#vitamin"
        variant="flat"
        radius="full"
        size="sm"
        className="bg-white/10 text-white font-semibold hover:bg-white/20 
                   data-[hover=true]:scale-[1.02] transition-transform"
      >
        Vitamin &amp; Khoáng Chất
      </Button>

      <Button
        as={Link}
        href="/posts"
        variant="flat"
        radius="full"
        size="sm"
        className="bg-white/10 text-white font-semibold hover:bg-white/20 
                   data-[hover=true]:scale-[1.02] transition-transform"
      >
        Tin Tức &amp; Bài Viết
      </Button>
    </div>
  </div>
</nav>

      {/* ========== COUPON STRIP UNDER MENU ========== */}
      <div className="w-full bg-white border-b border-red-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {coupons.map((item) => (
              <div
                key={item.code}
                className="min-w-[260px] flex items-center gap-3 border border-red-200 rounded-xl bg-white
                           shadow-[0_4px_12px_rgba(0,0,0,0.05)] px-3 py-3"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold text-xl md:text-2xl flex items-center justify-center shadow-inner">
                  %
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        NHAP MA: {item.code}
                      </p>
                      <p className="text-[11px] md:text-xs text-gray-600">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm leading-none">i</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] md:text-xs text-red-500 font-semibold">
                      {item.expiry}
                    </span>
                    <button
                      onClick={() => copyCode(item.code)}
                      className="text-[11px] md:text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-red-500"
                    >
                      Sao chep
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
