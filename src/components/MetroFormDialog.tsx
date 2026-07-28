import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "../lib/toast";

interface Props { open: boolean; onClose: () => void; }

export default function MetroFormDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Nama metro wajib diisi"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/metros", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menambahkan metro"); }
      toast.success("Metro ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["metros"] });
      setName(""); onClose();
    } catch (err: any) { toast.error(err.message || "Gagal menambahkan metro"); }
    finally { setSaving(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Tambah Metro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nama Metro</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Bali Metro" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
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