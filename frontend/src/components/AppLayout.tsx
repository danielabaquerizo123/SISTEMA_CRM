import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/oportunidades", label: "Oportunidades", icon: BriefcaseBusiness },
  { to: "/actividades", label: "Actividades", icon: Activity },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white px-5 py-6 lg:sticky lg:top-0 lg:h-screen">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <BarChart3 size={22} />
          </div>
          <div>
            <strong className="block text-base font-bold text-slate-950">CRM Académico</strong>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">Gestión comercial</span>
          </div>
        </div>

        <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
