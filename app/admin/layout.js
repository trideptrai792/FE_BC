"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      // Không có token hoặc không phải admin => đá về /login
      router.replace("/login");
      setAllowed(false);
    } else {
      setAllowed(true);
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!allowed) {
    // Đã redirect, tạm thời không render gì
    return null;
  }

  // Nếu qua được, render giao diện admin như cũ
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 font-bold text-xl border-b">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/category" className="block p-2 rounded hover:bg-gray-200">
            Category
          </Link>
          <Link href="/admin/product" className="block p-2 rounded hover:bg-gray-200">
            Product
          </Link>
          <Link href="/admin/post" className="block p-2 rounded hover:bg-gray-200">
            Post
          </Link>
          <Link href="/admin/user" className="block p-2 rounded hover:bg-gray-200">
            User
          </Link>
          <Link href="/admin/flash-sale">Flash Sale</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </header>

        {children}
      </main>
    </div>
  );
}
