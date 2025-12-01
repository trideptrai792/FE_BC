"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, setLogin] = useState("");      // email hoặc username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");  // THÊM: thông báo thành công
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message || "Đăng nhập thất bại");
      return;
    }

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.user?.roles) {
      localStorage.setItem("role", data.user.roles); // LƯU ROLE
    }

    setSuccess("Đăng nhập thành công!");
    // ví dụ: admin thì vào /admin, customer thì về /
    if (data.user?.roles === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (e) {
    console.error(e);
    setError("Lỗi kết nối server");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-600">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập
        </h1>

        {error && (
          <p className="mb-4 text-red-600 text-sm text-center">{error}</p>
        )}

        {success && (
          <p className="mb-4 text-green-600 text-sm text-center">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email hoặc Username
            </label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="admin hoặc admin@example.com"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-500"
          >
            Đăng nhập
          </button>
        </form>

        {/* Nút về trang chủ sau khi đăng nhập */}
        {success && (
          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-700"
          >
            Về trang chủ
          </button>
        )}
      </div>
    </div>
  );
}
