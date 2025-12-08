"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import userService from "../../../../lib/userService"; // app/admin/users/[id]/edit → ../../../../lib

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    roles: "customer",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");
        const u = await userService.getUser(id);
        setForm({
          name: u.name || "",
          email: u.email || "",
          username: u.username || "",
          phone: u.phone || "",
          roles: u.roles || "customer",
        });
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message || e.message || "Không tải được user"
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError("");
      await userService.updateUser(id, form);
      alert("Cập nhật user thành công");
      router.push("/admin/users");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Lỗi khi cập nhật user"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-sm">Đang tải dữ liệu người dùng...</p>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={() => router.push("/admin/users")}
          className="px-4 py-2 text-sm bg-gray-700 text-white rounded"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Sửa người dùng #{id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tên
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Số điện thoại
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Role
          </label>
          <select
            name="roles"
            value={form.roles}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
