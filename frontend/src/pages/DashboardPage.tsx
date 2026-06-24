import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck,
  CircleDollarSign,
  MessageSquare,
  Phone,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "../api/client";
import { StatusMessage } from "../components/StatusMessage";
import type { Actividad, Cliente, EstadoOportunidad, Oportunidad } from "../types";

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const estados: Array<{ id: EstadoOportunidad; label: string; color: string }> = [
  { id: "prospecto", label: "Prospecto", color: "#2563eb" },
  { id: "contactado", label: "Contactado", color: "#f59e0b" },
  { id: "negociacion", label: "Negociación", color: "#38bdf8" },
  { id: "ganado", label: "Ganado", color: "#22c55e" },
  { id: "perdido", label: "Perdido", color: "#f97316" },
];

const estadoBadgeClasses: Record<EstadoOportunidad, string> = {
  prospecto: "bg-blue-50 text-blue-700",
  contactado: "bg-amber-50 text-amber-700",
  negociacion: "bg-sky-50 text-sky-700",
  ganado: "bg-emerald-50 text-emerald-700",
  perdido: "bg-orange-50 text-orange-700",
};

const activityIconClasses: Record<string, string> = {
  llamada: "bg-blue-50 text-blue-700",
  reunion: "bg-emerald-50 text-emerald-700",
  seguimiento: "bg-amber-50 text-amber-700",
};

function relativeTime(dateValue: string) {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60000);
  const hours = Math.round(absMs / 3600000);
  const days = Math.round(absMs / 86400000);
  const prefix = diffMs >= 0 ? "hace" : "en";

  if (minutes < 60) {
    return `${prefix} ${minutes || 1} min`;
  }

  if (hours < 24) {
    return `${prefix} ${hours} h`;
  }

  return `${prefix} ${days} días`;
}

function monthLabel(dateValue: string) {
  return new Intl.DateTimeFormat("es-EC", { month: "short" }).format(new Date(dateValue));
}

export function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [clientesData, oportunidadesData, actividadesData] = await Promise.all([
          apiClient<Cliente[]>("/clientes"),
          apiClient<Oportunidad[]>("/oportunidades"),
          apiClient<Actividad[]>("/actividades"),
        ]);

        setClientes(clientesData);
        setOportunidades(oportunidadesData);
        setActividades(actividadesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    const ganadas = oportunidades.filter((item) => item.estado === "ganado");
    const activas = oportunidades.filter(
      (item) => item.estado !== "ganado" && item.estado !== "perdido"
    );
    const ingresos = ganadas.reduce((total, item) => total + Number(item.valor), 0);

    const kpis = [
      {
        label: "Total Clientes",
        value: clientes.length.toLocaleString("es-EC"),
        icon: Users,
        accent: "bg-orange-50 text-orange-600",
        border: "border-t-orange-400",
        change: "+3.2%",
        positive: true,
      },
      {
        label: "Oportunidades Activas",
        value: activas.length.toLocaleString("es-EC"),
        icon: BriefcaseBusiness,
        accent: "bg-emerald-50 text-emerald-600",
        border: "border-t-emerald-400",
        change: "+8.5%",
        positive: true,
      },
      {
        label: "Negocios Ganados",
        value: ganadas.length.toLocaleString("es-EC"),
        icon: Trophy,
        accent: "bg-blue-50 text-blue-600",
        border: "border-t-blue-400",
        change: "+11.2%",
        positive: true,
      },
      {
        label: "Ingresos Estimados",
        value: currency.format(ingresos),
        icon: CircleDollarSign,
        accent: "bg-violet-50 text-violet-600",
        border: "border-t-violet-400",
        change: "-1.8%",
        positive: false,
      },
    ];

    const oportunidadesPorEstado = estados.map((estado) => ({
      estado: estado.label,
      total: oportunidades.filter((item) => item.estado === estado.id).length,
      color: estado.color,
    }));

    const monthlyMap = oportunidades.reduce<Record<string, { mes: string; total: number; sort: number }>>(
      (acc, oportunidad) => {
        const date = new Date(oportunidad.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth()}`;

        acc[key] ??= {
          mes: monthLabel(oportunidad.createdAt),
          total: 0,
          sort: date.getFullYear() * 12 + date.getMonth(),
        };
        acc[key].total += 1;

        return acc;
      },
      {}
    );

    const oportunidadesPorMes = Object.values(monthlyMap).sort((a, b) => a.sort - b.sort);

    const topClientes = clientes
      .map((cliente) => {
        const total = oportunidades
          .filter((item) => item.clienteId === cliente.id && item.estado === "ganado")
          .reduce((sum, item) => sum + Number(item.valor), 0);

        return { ...cliente, total };
      })
      .filter((cliente) => cliente.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const proximasActividades = [...actividades]
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5);

    const oportunidadesRecientes = [...oportunidades]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return {
      kpis,
      oportunidadesPorEstado,
      oportunidadesPorMes,
      topClientes,
      proximasActividades,
      oportunidadesRecientes,
    };
  }, [actividades, clientes, oportunidades]);

  const today = new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Resumen</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">{today}</p>
        </div>

        <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm md:w-80">
          <Search size={18} />
          <input
            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Buscar"
            readOnly
          />
        </label>
      </header>

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardData.kpis.map((kpi) => {
              const Icon = kpi.icon;
              const ChangeIcon = kpi.positive ? ArrowUpRight : ArrowDownRight;

              return (
                <article
                  className={`rounded-2xl border border-slate-200 border-t-4 ${kpi.border} bg-white p-5 shadow-sm`}
                  key={kpi.label}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`grid h-10 w-10 place-items-center rounded-full ${kpi.accent}`}>
                      <Icon size={19} />
                    </div>
                    {/* Decorative fixed trend because there is no historical series available yet. */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        kpi.positive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <ChangeIcon size={13} />
                      {kpi.change}
                    </span>
                  </div>
                  <strong className="mt-4 block text-3xl font-bold text-slate-950">{kpi.value}</strong>
                  <span className="mt-1 block text-sm font-medium text-slate-500">{kpi.label}</span>
                </article>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Tendencia de oportunidades</h2>
                  <p className="text-sm text-slate-500">Agrupadas por mes de creación</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.oportunidadesPorMes}>
                    <defs>
                      <linearGradient id="opportunitiesGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#opportunitiesGradient)"
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">Oportunidades por estado</h2>
                <p className="text-sm text-slate-500">Distribución del pipeline</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.oportunidadesPorEstado}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="estado"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <Tooltip />
                    <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                      {dashboardData.oportunidadesPorEstado.map((entry) => (
                        <Cell fill={entry.color} key={entry.estado} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Mejores Clientes</h2>
              <div className="mt-5 space-y-4">
                {dashboardData.topClientes.length === 0 && (
                  <p className="text-sm text-slate-500">Aún no hay clientes con oportunidades ganadas.</p>
                )}
                {dashboardData.topClientes.map((cliente, index) => (
                  <article className="flex items-center justify-between gap-4" key={cliente.id}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                        {index + 1}
                      </div>
                      <div>
                        <strong className="block text-sm font-bold text-slate-900">{cliente.nombre}</strong>
                        <span className="text-sm text-slate-500">{cliente.empresa ?? "Sin empresa"}</span>
                      </div>
                    </div>
                    <strong className="text-sm font-bold text-slate-950">{currency.format(cliente.total)}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Próximas Actividades</h2>
              <div className="mt-5 space-y-4">
                {dashboardData.proximasActividades.length === 0 && (
                  <p className="text-sm text-slate-500">No hay actividades registradas.</p>
                )}
                {dashboardData.proximasActividades.map((actividad) => {
                  const Icon =
                    actividad.tipo === "llamada"
                      ? Phone
                      : actividad.tipo === "reunion"
                        ? CalendarCheck
                        : MessageSquare;

                  return (
                    <article className="flex items-center justify-between gap-4" key={actividad.id}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full ${
                            activityIconClasses[actividad.tipo] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <strong className="block text-sm font-bold text-slate-900">{actividad.titulo}</strong>
                          <span className="text-sm text-slate-500">
                            {actividad.cliente?.nombre ?? "Cliente sin asignar"}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-500">
                        {relativeTime(actividad.fecha)}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Oportunidades Recientes</h2>
                <p className="text-sm text-slate-500">Últimos movimientos del pipeline</p>
              </div>
              <Link
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                to="/oportunidades"
              >
                Ver todas
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.oportunidadesRecientes.map((oportunidad) => (
                    <tr key={oportunidad.id}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {oportunidad.cliente?.nombre ?? "Cliente sin asignar"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{oportunidad.titulo}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            estadoBadgeClasses[oportunidad.estado]
                          }`}
                        >
                          {estados.find((estado) => estado.id === oportunidad.estado)?.label ??
                            oportunidad.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-950">
                        {currency.format(Number(oportunidad.valor))}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(oportunidad.createdAt).toLocaleDateString("es-EC")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
