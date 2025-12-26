"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "../../../lib/axiosClient";

export default function AdminMenuAddPage() {
  const router = useRouter();

  const [parents, setParents] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "custom",
    position: "mainmenu",
    parent_id: 0,
    sort_order: 0,
    status: 1,
    link: "",
    table_id: "",
    category_slug: "",
  });

  const parentOptions = useMemo(() => {
    return (parents || []).filter((m) => Number(m.parent_id || 0) === 0);
  }, [parents]);

  const loadParents = async () => {
    const res = await axiosClient.get("/admin/menus");
    const list = res.data?.data || [];
    setParents(list);
  };

  const loadCategories = async () => {
    const res = await axiosClient.get("/categories");
    const list = res.data?.data || res.data || [];
    setCategories(list);
  };

  useEffect(() => {
    Promise.all([loadParents(), loadCategories()]).catch(() => {});
  }, []);

  const onChange = (k) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const onPickCategory = (e) => {
    const slug = e.target.value;
    const cat = categories.find((c) => String(c.slug) === String(slug));
    setForm((prev) => ({
      ...prev,
      type: "category",
      category_slug: slug,
      name: prev.name || (cat?.name || ""),
      link: slug ? `/danh-muc/${slug}` : prev.link,
      table_id: cat?.id ? String(cat.id) : "",
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");

    const payload = {
      name: String(form.name || "").trim(),
      link: String(form.link || "").trim(),
      type: form.type,
      parent_id: Number(form.parent_id || 0),
      sort_order: Number(form.sort_order || 0),
      table_id: form.table_id === "" ? null : Number(form.table_id),
      position: form.position,
      status: Number(form.status || 1),
    };

    if (!payload.name) {
      setError("Tên menu không được rỗng.");
      return;
    }
    if (!payload.link) {
      setError("Link không được rỗng.");
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post("/admin/menus", payload);
      setOkMsg("Tạo menu thành công.");
      router.push("/admin/menus");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        err.message ||
        "Lỗi tạo menu";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Thêm menu</h2>
        <Link
          href="/admin/menus"
          className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Quay lại
        </Link>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {okMsg && <p className="mb-3 text-sm text-green-600">{okMsg}</p>}

      <form onSubmit={submit} className="bg-white border rounded-xl p-4 space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Vị trí</label>
            <select
              value={form.position}
              onChange={onChange("position")}
              className="w-full border rounded px-2 py-2"
            >
              <option value="mainmenu">mainmenu</option>
              <option value="footermenu">footermenu</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={onChange("status")}
              className="w-full border rounded px-2 py-2"
            >
              <option value={1}>Hiển thị</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Menu cha</label>
            <select
              value={form.parent_id}
              onChange={onChange("parent_id")}
              className="w-full border rounded px-2 py-2"
            >
              <option value={0}>-- không có --</option>
              {parentOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.id} - {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={onChange("sort_order")}
              className="w-full border rounded px-2 py-2"
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Loại</label>
          <select
            value={form.type}
            onChange={onChange("type")}
            className="w-full border rounded px-2 py-2"
          >
            <option value="custom">custom</option>
            <option value="category">category</option>
            <option value="page">page</option>
            <option value="topic">topic</option>
          </select>
        </div>

        {form.type === "category" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Chọn category</label>
              <select
                value={form.category_slug}
                onChange={onPickCategory}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">-- chọn --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    #{c.id} - {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">table_id (category id)</label>
              <input
                type="number"
                value={form.table_id}
                onChange={onChange("table_id")}
                className="w-full border rounded px-2 py-2"
                min={0}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Tên menu</label>
          <input
            value={form.name}
            onChange={onChange("name")}
            className="w-full border rounded px-3 py-2"
            placeholder="VD: Mass Gainer"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Link</label>
          <input
            value={form.link}
            onChange={onChange("link")}
            className="w-full border rounded px-3 py-2"
            placeholder='VD: /danh-muc/mass-gainer hoặc https://...'
          />
        </div>

        <div className="flex gap-2">
          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Tạo menu"}
          </button>

          <Link
            href="/admin/menus"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
