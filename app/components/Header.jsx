"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Input, Button } from "@heroui/react";
import Link from "next/link";

export default function Header() {
  return (
    <>
      {/* ========== TOP BLACK BAR ========== */}
      <div className="w-full bg-black text-white text-sm py-2 px-6 flex justify-between">
        <span>100% HÀNG CHÍNH HÃNG</span>
        <span>GIAO HÀNG TOÀN QUỐC</span>
      </div>

      {/* ========== MAIN HEADER (HeroUI Navbar) ========== */}
      <Navbar maxWidth="xl" className="bg-white border-b border-gray-200 shadow-sm">
        {/* LOGO */}
        <NavbarBrand className="gap-3">
          <img src="/images/logo.png" className="h-12 w-auto" alt="Logo" />
          <div className="flex flex-col">
 
</div>
          <span className="text-2xl font-bold text-black">E-Commerce Shop</span>
        </NavbarBrand>

        {/* SEARCH BAR */}
        <NavbarContent className="flex-1 justify-center px-6 hidden md:flex">
          <Input
            aria-label="Tìm kiếm sản phẩm"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="max-w-xl"
            radius="sm"
          />
        </NavbarContent>

        {/* ICONS + ĐĂNG NHẬP */}
        <NavbarContent justify="end" className="gap-4">
          <NavbarItem className="hidden sm:flex items-center gap-4 text-xl text-black">
            <i className="fa-solid fa-phone hover:text-red-600 cursor-pointer" />
            <i className="fa-solid fa-user hover:text-red-600 cursor-pointer" />
            <i className="fa-solid fa-cart-shopping hover:text-red-600 cursor-pointer" />
          </NavbarItem>

          <NavbarItem>
        
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* ========== RED MENU BAR ========== */}
      <nav className="w-full bg-red-600 text-white font-semibold px-6 py-3">
        <ul className="flex space-x-10">
          <li>
            <Link href="/#whey" className="hover:text-yellow-300">
              Whey Protein
            </Link>
          </li>
          <li>
            <Link href="/#mass" className="hover:text-yellow-300">
              Mass Gainer
            </Link>
          </li>
          <li>
            <Link href="/#vitamin" className="hover:text-yellow-300">
              Vitamin &amp; Khoáng Chất
            </Link>
          </li>
          <li>
            <Link href="/posts" className="hover:text-yellow-300">
              Tin Tức &amp; Bài Viết
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
