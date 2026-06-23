import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiClient } from "../api/client";
import { Modal } from "../components/Modal";
import { StatusMessage } from "../components/StatusMessage";
import type { Cliente, EstadoOportunidad, Oportunidad } from "../types";

const estados: Array<{ id: EstadoOportunidad; label: string }> = [
  { id: "prospecto", label: "Prospecto" },
  { id: "contactado", label: "Contactado" },
  { id: "negociacion", label: "Negociación" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
];

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

type OportunidadForm = {
  titulo: string;
  descripcion: string;
  valor: string;
  clienteId: string;
};

const initialForm: OportunidadForm = {
  titulo: "",
  descripcion: "",
  valor: "",
  clienteId: "",
};

export function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<OportunidadForm>(initialForm);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [oportunidadesData, clientesData] = await Promise.all([
        apiClient<Oportunidad[]>("/oportunidades"),
        apiClient<Cliente[]>("/clientes"),
      ]);

      setOportunidades(oportunidadesData);
      setClientes(clientesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las oportunidades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const oportunidadesPorEstado = useMemo(() => {
    return estados.reduce<Record<EstadoOportunidad, Oportunidad[]>>(
      (acc, estado) => {
        acc[estado.id] = oportunidades.filter((item) => item.estado === estado.id);
        return acc;
      },
      {
        prospecto: [],
        contactado: [],
        negociacion: [],
        ganado: [],
        perdido: [],
      }
    );
  }, [oportunidades]);

  async function moveEstado(oportunidad: Oportunidad, direction: -1 | 1) {
    const currentIndex = estados.findIndex((estado) => estado.id === oportunidad.estado);
    const nextEstado = estados[currentIndex + direction];

    if (!nextEstado) {
      return;
    }

    try {
      setError("");
      const updated = await apiClient<Oportunidad>(`/oportunidades/${oportunidad.id}/estado`, {
        method: "PATCH",
        body: { estado: nextEstado.id },
      });

      setOportunidades((current) =>
        current.map((item) => (item.id === oportunidad.id ? { ...item, ...updated } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await apiClient<Oportunidad>("/oportunidades", {
        method: "POST",
        body: {
          titulo: form.titulo,
          descripcion: form.descripcion || null,
          valor: Number(form.valor),
          clienteId: Number(form.clienteId),
        },
      });

      setModalOpen(false);
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la oportunidad");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Pipeline</span>
          <h1>Oportunidades</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Nueva Oportunidad
        </button>
      </div>

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <div className="kanban-board">
          {estados.map((estado, columnIndex) => (
            <section className="kanban-column" key={estado.id}>
              <header>
                <h2>{estado.label}</h2>
                <span>{oportunidadesPorEstado[estado.id].length}</span>
              </header>
              <div className="kanban-cards">
                {oportunidadesPorEstado[estado.id].map((oportunidad) => (
                  <article className="opportunity-card" key={oportunidad.id}>
                    <div>
                      <strong>{oportunidad.titulo}</strong>
                      <span>{oportunidad.cliente?.nombre ?? "Cliente sin asignar"}</span>
                    </div>
                    <p>{currency.format(Number(oportunidad.valor))}</p>
                    <div className="card-actions">
                      <button
                        className="icon-button"
                        type="button"
                        disabled={columnIndex === 0}
                        onClick={() => moveEstado(oportunidad, -1)}
                        aria-label="Mover al estado anterior"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        disabled={columnIndex === estados.length - 1}
                        onClick={() => moveEstado(oportunidad, 1)}
                        aria-label="Mover al siguiente estado"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Nueva oportunidad" onClose={() => setModalOpen(false)}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Título
              <input
                required
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
              />
            </label>
            <label>
              Descripción
              <textarea
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
              />
            </label>
            <label>
              Valor
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.valor}
                onChange={(event) => setForm({ ...form, valor: event.target.value })}
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
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
