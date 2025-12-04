"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const role = searchParams.get("role") || "customer";

    if (typeof window !== "undefined" && token) {
      localStorage.setItem("token", token);
      if (name) {
        // name có thể đã được encode trong query, nên decode
        localStorage.setItem("displayName", decodeURIComponent(name));
      }
      localStorage.setItem("role", role);
    }

    // Chuyển hướng vào trong web
    if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">
          Đang xử lý đăng nhập Google...
        </h1>
        <p className="text-sm text-gray-600">
          Vui lòng chờ trong giây lát, hệ thống đang chuyển bạn vào trang chủ.
        </p>
      </div>
    </div>
  );
}
