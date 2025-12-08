"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import menuService from "../lib/menuService"; // chỉnh path nếu khác

export default function Footer() {
  const [footerMenu, setFooterMenu] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const menus = await menuService.fetchMenusByPosition("footermenu");
        setFooterMenu(menus || []);
      } catch (e) {
        console.error("Load footermenu error:", e);
      }
    };
    load();
  }, []);

  return (
    <footer className="mt-12 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} E-Commerce Shop. All rights reserved.
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {footerMenu.map((item) => {
          const href = item.link || item.url || item.slug || "#";

            return (
              <Link
                key={item.id}
                href={href}
                className="text-gray-600 hover:text-red-600"
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
