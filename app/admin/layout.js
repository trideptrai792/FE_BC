"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { HeroUIProvider, Card, Listbox, ListboxItem, Spacer, Spinner } from "@heroui/react";

const NAV_ITEMS = [
  { href: "/admin/category", label: "Category" },
  { href: "/admin/product", label: "Product" },
  { href: "/admin/product-store", label: "Tồn kho" },
  { href: "/admin/post", label: "Post" },
  { href: "/admin/users", label: "User" },
  { href: "/admin/flash-sale", label: "Flash Sale" },
  { href: "/admin/menus", label: "Menu" },
  { href: "/admin/product-sale", label: "Giá Sale" },
  { href: "/admin/product-store-logs", label: "Stock Logs" },
  { href: "/admin/carts", label: "Gio Hang" }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking"); // checking | denied | ok

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role !== "admin") {
      setStatus("denied");
      router.replace("/login");
      return;
    }
    setStatus("ok");
  }, [router]);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        active: pathname?.startsWith(item.href),
      })),
    [pathname]
  );

  if (status === "checking") {
    return (
      <HeroUIProvider>
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
          <Spinner size="sm" color="primary" /> <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
        </div>
      </HeroUIProvider>
    );
  }

  if (status === "denied") return null;

  return (
    <HeroUIProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <Card className="w-64 h-screen rounded-none shadow-sm border-r border-default-200">
          <div className="px-6 py-5 border-b border-default-200">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-xs text-default-500">Quản trị hệ thống</p>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4">
            <Listbox aria-label="Admin navigation" variant="flat" color="primary">
              {navItems.map((item) => (
                <ListboxItem
                  key={item.href}
                  href={item.href}
                  as={Link}
                  className={item.active ? "font-semibold" : ""}
                  variant={item.active ? "solid" : "light"}
                >
                  {item.label}
                </ListboxItem>
              ))}
            </Listbox>
          </div>
        </Card>

        {/* Main */}
        <main className="flex-1 p-6">
          <header className="mb-6 pb-4 border-b border-default-200">
            <p className="text-xs uppercase text-default-400">Admin Dashboard</p>
            <h2 className="text-2xl font-semibold text-default-900">Quản lý</h2>
          </header>

          <div className="bg-white rounded-2xl shadow-sm border border-default-200 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </HeroUIProvider>
  );
}
