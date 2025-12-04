"use client";

import { useEffect } from "react";

const GOOGLE_LOGIN_URL =
  "http://localhost:8000/api/auth/google/redirect?redirect=http://localhost:3000/login-success";

export default function LoginGooglePage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = GOOGLE_LOGIN_URL;
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-600">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Đăng nhập với Google
        </h1>
        <p className="text-gray-600 mb-2">
          Đang chuyển hướng tới Google, vui lòng chờ...
        </p>
      </div>
    </div>
  );
}
