import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import Home from "./pages/Home";
import PartnerDetail from "./pages/PartnerDetail";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-[1200px] px-4 h-14 flex items-center justify-between">

  <Link to="/" className="flex items-center gap-2">
    <Users className="size-5 text-indigo-600" />
    <span className="font-semibold">
      Portal Data Mitra
    </span>
  </Link>

</div>
      </nav>
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/partner/:id" element={<PartnerDetail />} />
        </Routes>
      </main>
    </div>
  );
}