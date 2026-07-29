import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../lib/toast";

interface Props { open: boolean; onClose: () => void; partner?: any; }

export default function PartnerFormDialog({ open, onClose, partner }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!partner;

  const [metroId, setMetroId] = useState("");
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [cid, setCid] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [complaintGroup, setComplaintGroup] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: metros = [] } = useQuery<any[]>({
    queryKey: ["metros"],
    queryFn: () => fetch("/api/metros").then((r) => r.json()),
  });

  useEffect(() => {
    if (partner) {
      setMetroId(String(partner.metro_id)); setName(partner.name || "");
      setSite(partner.site || ""); setCid(partner.cid || "");
      setContactName(partner.contact_name || ""); setContactPhone(partner.contact_phone || "");
      setComplaintGroup(partner.complaint_group || ""); setNotes(partner.notes || "");
    } else {
      setMetroId(metros[0]?.id ? String(metros[0].id) : "");
      setName(""); setSite(""); setCid(""); setContactName(""); setContactPhone("");
      setComplaintGroup(""); setNotes("");
    }
  }, [partner, metros, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !site.trim() || !cid.trim() || !metroId) {
      toast.error("Nama, site, CID, dan metro wajib diisi"); return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/partners/${partner.id}` : "/api/partners";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metro_id: Number(metroId), name, site, cid,
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          complaint_group: complaintGroup || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      toast.success(isEdit ? "Mitra diperbarui" : "Mitra ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      onClose();
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan"); }
    finally { setSaving(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{isEdit ? "Edit Mitra" : "Tambah Mitra"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Metro</label>
            <select value={metroId} onChange={(e) => setMetroId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Pilih metro</option>
              {metros.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nama Mitra *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="PT..." /></div>
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Site *</label>
              <input value={site} onChange={(e) => setSite(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="JKTC01" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">CID *</label>
              <input value={cid} onChange={(e) => setCid(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="CID-JKT-001" /></div>
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nama Kontak</label>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Budi Santoso" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Telepon Kontak</label>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0812-..." /></div>
            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Grup Komplain</label>
              <input value={complaintGroup} onChange={(e) => setComplaintGroup(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="t.me/jkt atau link WA" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Catatan</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Catatan tambahan..." /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Batal</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50">
              {saving ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}