"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import menuService from "../../../../lib/menuService";

const TYPE_OPTIONS = ["category", "page", "topic", "custom"];
const POSITION_OPTIONS = ["mainmenu", "footermenu"];

export default function MenuEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState({ name: "", link: "", type: "custom", position: "mainmenu", sort_order: 0, parent_id: "", status: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await menuService.getById(id);
                setForm({
                    name: res.name || "",
                    link: res.link || "",
                    type: res.type || "custom",
                    position: res.position || "mainmenu",
                    sort_order: res.sort_order ?? 0,
                    parent_id: res.parent_id ?? "",
                    status: res.status === 1,
                });
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Không tải được menu");
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await menuService.update(id, {
                ...form,
                parent_id: form.parent_id ? Number(form.parent_id) : 0,
                sort_order: Number(form.sort_order) || 0,
                status: form.status ? 1 : 0,
            });
            router.push("/admin/menus");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Không lưu được menu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-4">Đang tải...</p>;

    return (
        <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xl font-semibold">Sửa menu</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Tên</label>
                        <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Link</label>
                        <input className="w-full border rounded px-3 py-2" value={form.link} onChange={(e) => onChange("link", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Type</label>
                        <select className="w-full border rounded px-3 py-2" value={form.type} onChange={(e) => onChange("type", e.target.value)}>
                            {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Position</label>
                        <select className="w-full border rounded px-3 py-2" value={form.position} onChange={(e) => onChange("position", e.target.value)}>
                            {POSITION_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Sort order</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={form.sort_order} onChange={(e) => onChange("sort_order", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Parent ID</label>
                        <input type="number" className="w-full border rounded px-3 py-2" value={form.parent_id} onChange={(e) => onChange("parent_id", e.target.value)} placeholder="0 hoặc để trống" />
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.status} onChange={(e) => onChange("status", e.target.checked)} />
                    Hiển thị
                </label>

                <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>Lưu</button>
                    <button type="button" className="px-4 py-2 border rounded" onClick={() => router.push("/admin/menus")}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
