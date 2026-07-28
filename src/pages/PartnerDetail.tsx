import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ArrowLeft, Pencil, Trash2, MessageCircle, ExternalLink, Plus } from "lucide-react";
import { toast } from "../lib/toast";
import PartnerFormDialog from "../components/PartnerFormDialog";
import ComplaintGroupFormDialog from "../components/ComplaintGroupFormDialog";

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delGroupId, setDelGroupId] = useState<string | null>(null);

  const { data: partner, isLoading } = useQuery<any>({
    queryKey: ["partner", id],
    queryFn: () => fetch(`/api/partners/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: complaintGroups = [] } = useQuery<any[]>({
    queryKey: ["complaint-groups", partner?.metro_id],
    queryFn: () => fetch(`/api/complaint-groups?metro_id=${partner.metro_id}`).then((r) => r.json()),
    enabled: !!partner?.metro_id,
  });

  if (isLoading) return <div className="py-20 text-center text-slate-500 dark:text-slate-400">Memuat detail mitra...</div>;

  if (!partner || partner.error) return (
    <div className="py-20 text-center">
      <p className="text-slate-500 dark:text-slate-400">Mitra tidak ditemukan.</p>
      <Link to="/" className="border border-state-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Kembali ke daftar</Link>
    </div>
  );

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-slate-900 dark:text-white">Data Mitra</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-slate-900 dark:text-white">{partner.name}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{partner.name}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{partner.metro_name}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setShowEditForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            <Pencil className="size-4" /> Edit
          </button>
          <button disabled={deleting} onClick={async () => {
            if (!confirm("Hapus mitra ini?")) return;
            setDeleting(true);
            try {
              await fetch(`/api/partners/${id}`, { method: "DELETE" });
              toast.success("Mitra dihapus");
              queryClient.invalidateQueries({ queryKey: ["partners"] });
              navigate("/");
            } catch { toast.error("Gagal menghapus"); }
            finally { setDeleting(false); }
          }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
            <Trash2 className="size-4" /> Hapus
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-base font-semibold mb-3">Informasi Mitra</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><div className="text-xs text-slate-400 mb-0.5">Site</div><div className="text-sm font-medium">{partner.site}</div></div>
            <div><div className="text-xs text-slate-400 mb-0.5">CID</div><div className="text-sm font-medium font-mono">{partner.cid}</div></div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-base font-semibold mb-3">Kontak</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {partner.contact_name && <div><div className="text-xs text-slate-400 mb-0.5">Nama Kontak</div><div className="text-sm font-medium">{partner.contact_name}</div></div>}
            {partner.contact_phone && <div><div className="text-xs text-slate-400 mb-0.5">Telepon Kontak</div><div className="text-sm font-medium">{partner.contact_phone}</div></div>}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-base font-semibold mb-3">Grup / Link Komplain</h3>
          {partner.complaint_group ? (
            <a href={partner.complaint_group} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:underline">
              <ExternalLink className="size-3.5" />{partner.complaint_group}
            </a>
          ) : (
            <p className="text-sm text-slate-400">Belum ada link komplain terdaftar.</p>
          )}
        </div>

        {partner.metro_id && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Grup Komplain {partner.metro_name}</h3>
              <button onClick={() => setShowGroupForm(true)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                <Plus className="size-3" />
              </button>
            </div>
            {complaintGroups.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {complaintGroups.map((g: any) => (
                  <div key={g.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 uppercase">{g.type}</span>
                        <span className="text-sm font-medium">{g.label}</span>
                      </div>
                      {g.value && (
                        <div className="mt-1">
                          <a href={g.type === "phone" ? `tel:${g.value}` : g.value}
                            target={g.type === "phone" ? undefined : "_blank"} rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
                            <MessageCircle className="size-3.5" />{g.value}
                          </a>
                        </div>
                      )}
                      {g.notes && <div className="mt-0.5 text-xs text-slate-400">{g.notes}</div>}
                    </div>
                    <button disabled={delGroupId === g.id} onClick={async () => {
                      setDelGroupId(g.id);
                      try {
                        await fetch(`/api/complaint-groups/${g.id}`, { method: "DELETE" });
                        queryClient.invalidateQueries({ queryKey: ["complaint-groups"] });
                        toast.success("Grup komplain dihapus");
                      } catch { toast.error("Gagal menghapus"); }
                      finally { setDelGroupId(null); }
                    }} className="ml-2 rounded-md border border-slate-200 dark:border-slate-700 p-1 text-slate-400 hover:text-red-500 hover:border-red-200 disabled:opacity-50">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-2">Belum ada grup komplain untuk metro ini.</p>
            )}
          </div>
        )}

        {partner.notes && (
          <div className="rounded-lg border border-slate-200 dark:bg-slate-900 p-5">
            <h3 className="text-base font-semibold mb-2">Catatan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{partner.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
          <ArrowLeft className="size-4" /> Kembali ke daftar
        </Link>
      </div>

      <PartnerFormDialog open={showEditForm} onClose={() => setShowEditForm(false)} partner={partner} />
      <ComplaintGroupFormDialog open={showGroupForm} onClose={() => setShowGroupForm(false)} defaultMetroId={partner.metro_id} />
    </div>
  );
}