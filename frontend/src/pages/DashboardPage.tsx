import { CalendarClock, CircleDollarSign, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { StatusMessage } from "../components/StatusMessage";
import type { Actividad, Cliente, Oportunidad } from "../types";

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

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

  const kpis = useMemo(() => {
    const ganadas = oportunidades.filter((item) => item.estado === "ganado");
    const activas = oportunidades.filter(
      (item) => item.estado !== "ganado" && item.estado !== "perdido"
    );
    const ingresos = ganadas.reduce((total, item) => total + Number(item.valor), 0);

    return [
      {
        label: "Total Clientes",
        value: clientes.length,
        icon: Users,
      },
      {
        label: "Oportunidades Activas",
        value: activas.length,
        icon: CircleDollarSign,
      },
      {
        label: "Negocios Ganados",
        value: ganadas.length,
        icon: Trophy,
      },
      {
        label: "Ingresos Estimados",
        value: currency.format(ingresos),
        icon: CalendarClock,
      },
    ];
  }, [clientes.length, oportunidades]);

  const recentActivities = actividades.slice(0, 5);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Resumen</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <>
          <div className="kpi-grid">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;

              return (
                <article className="kpi-card" key={kpi.label}>
                  <div className="kpi-icon">
                    <Icon size={22} />
                  </div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                </article>
              );
            })}
          </div>

          <section className="panel">
            <div className="panel-header">
              <h2>Actividades recientes</h2>
            </div>
            <StatusMessage
              empty={recentActivities.length === 0}
              emptyText="No hay actividades recientes."
            />
            <div className="activity-list">
              {recentActivities.map((actividad) => (
                <article className="activity-item" key={actividad.id}>
                  <div>
                    <strong>{actividad.titulo}</strong>
                    <span>{actividad.cliente?.nombre ?? "Cliente sin asignar"}</span>
                  </div>
                  <time>{new Date(actividad.fecha).toLocaleDateString("es-EC")}</time>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
