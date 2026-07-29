import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../lib/toast";

const TYPES = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "phone", label: "Telepon" },
  { value: "email", label: "Email" },
  { value: "other", label: "Lainnya" },
];

interface Props { open: boolean; onClose: () => void; defaultMetroId?: number; }

export default function ComplaintGroupFormDialog({ open, onClose, defaultMetroId }: Props) {
  const queryClient = useQueryClient();
  const { data: metros = [] } = useQuery<any[]>({
    queryKey: ["metros"], queryFn: () => fetch("/api/metros").then((r) => r.json()),
  });

  const [metroId, setMetroId] = useState(defaultMetroId ? String(defaultMetroId) : "");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("whatsapp");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!metroId || !label.trim() || !type || !value.trim()) {
      toast.error("Metro, label, tipe, dan value wajib diisi"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/complaint-groups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metro_id: Number(metroId), label: label.trim(), type, value: value.trim(), notes: notes.trim() || null }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menambahkan grup komplain"); }
      toast.success("Grup komplain ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["complaint-groups"] });
      setLabel(""); setValue(""); setNotes(""); onClose();
    } catch (err: any) { toast.error(err.message || "Gagal menambahkan"); }
    finally { setSaving(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Tambah Grup Komplain</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!defaultMetroId && (
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Metro</label>
              <select value={metroId} onChange={(e) => setMetroId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Pilih metro</option>
                {metros.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select></div>
          )}
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Label *</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Grup WhatsApp Bandung" /></div>
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tipe *</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Value / Link *</label>
            <input value={value} onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://chat.whatsapp.com/... atau 021-..." /></div>
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Catatan</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Jam kerja Senin-Jumat" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Batal</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50">
              {saving ? "..." : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}