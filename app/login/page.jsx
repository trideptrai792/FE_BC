"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, setLogin] = useState("");      // email hoặc username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE = ", data); // <- rất quan trọng

    if (!res.ok) {
      setError(data.message || "Đăng nhập thất bại, vui lòng kiểm tra lại.");
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      // chuẩn hóa token
      const token =
        data.token ||
        data.access_token ||
        data.jwt ||
        data.data?.token ||
        null;

      if (token) {
        localStorage.setItem("token", token);
      }

      // chuẩn hóa role (admin / customer / user...)
      const role =
        data.user?.role ||
        (Array.isArray(data.user?.roles)
          ? data.user.roles[0]
          : data.user?.roles) ||
        data.role ||
        data.data?.role ||
        "user";

      localStorage.setItem("role", role);

      // chuẩn hóa tên hiển thị
      const displayName =
        data.user?.fullName ||
        data.user?.name ||
        data.user?.username ||
        data.user?.email ||
        data.user?.phone ||
        data.customer?.fullName ||
        data.customer?.name ||
        data.customer?.username ||
        data.customer?.email ||
        data.customer?.phone ||
        login;

      localStorage.setItem("displayName", displayName);
    }

    // redirect theo role
    const roleFinal =
      data.user?.role ||
      (Array.isArray(data.user?.roles)
        ? data.user.roles[0]
        : data.user?.roles) ||
      data.role ||
      data.data?.role ||
      "user";

    if (roleFinal === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (err) {
    console.error(err);
    setError("Lỗi hệ thống. Vui lòng thử lại sau.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Đăng nhập hệ thống
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Email hoặc tên đăng nhập
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập email hoặc username..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập mật khẩu..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
