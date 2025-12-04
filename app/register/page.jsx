"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "../lib/axiosClient";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);

      // Gửi API Laravel: POST /api/auth/register
      const res = await axiosClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      const data = res.data;

      if (typeof window !== "undefined") {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user?.name) localStorage.setItem("displayName", data.user.name);
        if (data.user?.role) localStorage.setItem("role", data.user.role);
      }

      alert("Đăng ký thành công!");
      router.push("/");
    } catch (e) {
      console.error(e);

      if (e.response?.status === 422 && e.response?.data?.errors) {
        setFieldErrors(e.response.data.errors);
        setError("Vui lòng kiểm tra lại thông tin bên dưới");
      } else {
        setError(
          e.response?.data?.message ||
            e.message ||
            "Đăng ký thất bại, vui lòng thử lại"
        );
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-1 text-center">Đăng ký tài khoản</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Tạo tài khoản khách hàng để mua hàng nhanh chóng hơn
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
              required
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.name.join(", ")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.email.join(", ")}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Tối thiểu 6 ký tự"
              required
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.password.join(", ")}
              </p>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>
          <div>
    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
    <input
      type="text"
      name="phone"
      value={form.phone}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      placeholder="0123456789"
      required
    />
    {fieldErrors.phone && (
      <p className="text-xs text-red-600 mt-1">
        {fieldErrors.phone.join(", ")}
      </p>
    )}
  </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
