import { CalendarPlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiClient } from "../api/client";
import { StatusMessage } from "../components/StatusMessage";
import type { Actividad, Cliente } from "../types";

type ActividadForm = {
  titulo: string;
  tipo: string;
  fecha: string;
  clienteId: string;
};

const initialForm: ActividadForm = {
  titulo: "",
  tipo: "llamada",
  fecha: "",
  clienteId: "",
};

export function ActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<ActividadForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [actividadesData, clientesData] = await Promise.all([
        apiClient<Actividad[]>("/actividades"),
        apiClient<Cliente[]>("/clientes"),
      ]);

      setActividades(actividadesData);
      setClientes(clientesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las actividades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await apiClient<Actividad>("/actividades", {
        method: "POST",
        body: {
          titulo: form.titulo,
          tipo: form.tipo,
          fecha: form.fecha,
          clienteId: Number(form.clienteId),
        },
      });

      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la actividad");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(actividad: Actividad) {
    const confirmed = window.confirm(`¿Eliminar la actividad ${actividad.titulo}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await apiClient<void>(`/actividades/${actividad.id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la actividad");
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Seguimiento</span>
          <h1>Actividades</h1>
        </div>
      </div>

      <section className="split-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Nueva actividad</h2>
          </div>
          <label>
            Título
            <input
              required
              value={form.titulo}
              onChange={(event) => setForm({ ...form, titulo: event.target.value })}
            />
          </label>
          <label>
            Tipo
            <select
              required
              value={form.tipo}
              onChange={(event) => setForm({ ...form, tipo: event.target.value })}
            >
              <option value="llamada">Llamada</option>
              <option value="reunion">Reunión</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </label>
          <label>
            Fecha
            <input
              required
              type="datetime-local"
              value={form.fecha}
              onChange={(event) => setForm({ ...form, fecha: event.target.value })}
            />
          </label>
          <label>
            Cliente
            <select
              required
              value={form.clienteId}
              onChange={(event) => setForm({ ...form, clienteId: event.target.value })}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            <CalendarPlus size={18} />
            {saving ? "Guardando..." : "Crear actividad"}
          </button>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Listado</h2>
          </div>
          <StatusMessage loading={loading} error={error} empty={!loading && actividades.length === 0} />
          {!loading && !error && (
            <div className="activity-list full">
              {actividades.map((actividad) => (
                <article className="activity-item" key={actividad.id}>
                  <div>
                    <strong>{actividad.titulo}</strong>
                    <span>
                      {actividad.tipo} · {actividad.cliente?.nombre ?? "Cliente sin asignar"}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <time>{new Date(actividad.fecha).toLocaleString("es-EC")}</time>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(actividad)}
                      aria-label={`Eliminar ${actividad.titulo}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </section>
  );
}
