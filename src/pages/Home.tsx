import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, MapPin, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "../lib/toast";
import PartnerFormDialog from "../components/PartnerFormDialog";
import MetroFormDialog from "../components/MetroFormDialog";

export default function Home() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [metroId, setMetroId] = useState("");
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showMetroForm, setShowMetroForm] = useState(false);
  const [delMetroId, setDelMetroId] = useState<string | null>(null);

  const { data: metros = [] } = useQuery<any[]>({
    queryKey: ["metros"],
    queryFn: () => fetch("/api/metros").then((r) => r.json()),
  });

  const { data: partners = [], isLoading } = useQuery<any[]>({
    queryKey: ["partners", metroId, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (metroId) params.set("metro_id", metroId);
      if (search) params.set("search", search);
      return fetch(`/api/partners?${params}`).then((r) => r.json());
    },
  });

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const p of partners) {
      const m = p.metro_name || "Tanpa Metro";
      if (!map[m]) map[m] = [];
      map[m].push(p);
    }
    return map;
  }, [partners]);

  const metroNames = Object.keys(grouped).sort();

  async function deleteMetro(metroName: string) {
    const metro = metros.find((m: any) => m.name === metroName);
    if (!metro) return;
    if (!confirm(`Hapus metro "${metroName}" beserta semua data mitra di dalamnya?`)) return;
    setDelMetroId(String(metro.id));
    try {
      await fetch(`/api/metros/${metro.id}`, { method: "DELETE" });
      toast.success(`Metro "${metroName}" dihapus`);
      queryClient.invalidateQueries({ queryKey: ["metros"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    } catch {
      toast.error("Gagal menghapus metro");
    } finally {
      setDelMetroId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Data Mitra</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowMetroForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            <Plus className="size-4" /> Metro
          </button>
          <button onClick={() => setShowPartnerForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-800">
            <Plus className="size-4" /> Mitra
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Cari nama, site, atau CID..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={metroId} onChange={(e) => setMetroId(e.target.value)}
          className="w-full sm:w-[220px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm">
          <option value="">Semua Metro</option>
          {metros.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {isLoading && <div className="py-20 text-center text-slate-500">Memuat data mitra...</div>}

      {!isLoading && partners.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400">Tidak ada mitra ditemukan.</p>
          {(search || metroId) && (
            <button onClick={() => { setSearch(""); setMetroId(""); }}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
              Hapus filter
            </button>
          )}
        </div>
      )}

      {!isLoading && metroNames.map((metro) => (
        <div key={metro} className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{metro}</h2>
            <button onClick={() => deleteMetro(metro)} disabled={delMetroId !== null}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-red-500 hover:border-red-200 disabled:opacity-50">
              <Trash2 className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadwo-sm">
            {grouped[metro].map((p: any) => (
              <Link key={p.id} to={`/partner/${p.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 dark:text-white truncate">{p.name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{p.site}</span>
                    <span className="font-mono">{p.cid}</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 ml-4 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <PartnerFormDialog open={showPartnerForm} onClose={() => setShowPartnerForm(false)} />
      <MetroFormDialog open={showMetroForm} onClose={() => setShowMetroForm(false)} />
    </div>
  );
}