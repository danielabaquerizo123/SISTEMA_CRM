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
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BarChart3 size={22} />
          </div>
          <div>
            <strong>CRM Académico</strong>
            <span>Gestión comercial</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} className="nav-link">
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
