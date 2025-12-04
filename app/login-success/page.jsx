"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import loginSuccessService from "../lib/loginSuccessService";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get("token");
      const roleFromQuery = searchParams.get("role") || "customer";

      if (!token) {
        setError("Không tìm thấy token trong URL, đăng nhập Google thất bại.");
        return;
      }

      try {
        const user = await loginSuccessService.handleLoginSuccess(
          token,
          roleFromQuery
        );

        const role = user?.roles || roleFromQuery;

        // Chuyển thẳng vào web
        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } catch (e) {
        console.error(e);
        setError("Xử lý đăng nhập Google thất bại. Vui lòng thử lại.");
      }
    };

    run();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold mb-2 text-red-600">
            Lỗi đăng nhập
          </h1>
          <p className="text-sm text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500"
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">
          Đang xử lý đăng nhập Google...
        </h1>
        <p className="text-sm text-gray-600">
          Vui lòng chờ trong giây lát, hệ thống đang chuyển bạn vào trang web.
        </p>
      </div>
    </div>
  );
}
