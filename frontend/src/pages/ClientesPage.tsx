import { Edit3, Plus, Search, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiClient } from "../api/client";
import { Modal } from "../components/Modal";
import { StatusMessage } from "../components/StatusMessage";
import type { Cliente } from "../types";

type ClienteForm = {
  nombre: string;
  correo: string;
  telefono: string;
  empresa: string;
};

const initialForm: ClienteForm = {
  nombre: "",
  correo: "",
  telefono: "",
  empresa: "",
};

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteForm>(initialForm);

  async function loadClientes() {
    try {
      setLoading(true);
      setError("");
      setClientes(await apiClient<Cliente[]>("/clientes"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      return (
        cliente.nombre.toLowerCase().includes(normalizedQuery) ||
        cliente.correo.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [clientes, query]);

  const clientStats = useMemo(() => {
    const activos = clientes.filter((cliente) => cliente.estado === "activo").length;
    const inactivos = clientes.filter((cliente) => cliente.estado === "inactivo").length;

    return [
      {
        label: "Total Clientes",
        value: clientes.length,
        icon: Users,
        accent: "bg-blue-50 text-blue-700",
      },
      {
        label: "Clientes Activos",
        value: activos,
        icon: UserCheck,
        accent: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Clientes Inactivos",
        value: inactivos,
        icon: UserX,
        accent: "bg-rose-50 text-rose-700",
      },
    ];
  }, [clientes]);

  function openCreateModal() {
    setEditingCliente(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function openEditModal(cliente: Cliente) {
    setEditingCliente(cliente);
    setForm({
      nombre: cliente.nombre,
      correo: cliente.correo,
      telefono: cliente.telefono ?? "",
      empresa: cliente.empresa ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      const body = {
        ...form,
        telefono: form.telefono || null,
        empresa: form.empresa || null,
      };

      if (editingCliente) {
        await apiClient<Cliente>(`/clientes/${editingCliente.id}`, {
          method: "PUT",
          body,
        });
      } else {
        await apiClient<Cliente>("/clientes", {
          method: "POST",
          body,
        });
      }

      setModalOpen(false);
      await loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el cliente");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cliente: Cliente) {
    const confirmed = window.confirm(`¿Eliminar el cliente ${cliente.nombre}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await apiClient<void>(`/clientes/${cliente.id}`, { method: "DELETE" });
      await loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el cliente");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="block text-sm font-semibold uppercase text-blue-600">Contactos</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">Clientes</h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {clientes.length}
            </span>
          </div>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="flex">
        <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
            type="search"
            placeholder="Buscar por nombre o correo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-5 md:grid-cols-3">
          {clientStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={stat.label}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-full ${stat.accent}`}>
                  <Icon size={19} />
                </div>
                <strong className="mt-4 block text-3xl font-bold text-slate-950">
                  {stat.value}
                </strong>
                <span className="mt-1 block text-sm font-medium text-slate-500">
                  {stat.label}
                </span>
              </article>
            );
          })}
        </div>
      )}

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClientes.map((cliente) => {
                  const isActive = cliente.estado === "activo";

                  return (
                    <tr className="transition hover:bg-slate-50/70" key={cliente.id}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {cliente.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cliente.correo}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cliente.empresa ?? "Sin empresa"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {cliente.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                            type="button"
                            onClick={() => openEditModal(cliente)}
                            aria-label={`Editar ${cliente.nombre}`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                            type="button"
                            onClick={() => handleDelete(cliente)}
                            aria-label={`Eliminar ${cliente.nombre}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-2">
            <StatusMessage
              empty={filteredClientes.length === 0}
              emptyText="No hay clientes con ese criterio."
            />
          </div>
        </section>
      )}

      {modalOpen && (
        <Modal
          title={editingCliente ? "Editar cliente" : "Nuevo cliente"}
          onClose={() => setModalOpen(false)}
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                required
                value={form.nombre}
                onChange={(event) => setForm({ ...form, nombre: event.target.value })}
              />
            </label>
            <label>
              Correo
              <input
                required
                type="email"
                value={form.correo}
                onChange={(event) => setForm({ ...form, correo: event.target.value })}
              />
            </label>
            <label>
              Teléfono
              <input
                value={form.telefono}
                onChange={(event) => setForm({ ...form, telefono: event.target.value })}
              />
            </label>
            <label>
              Empresa
              <input
                value={form.empresa}
                onChange={(event) => setForm({ ...form, empresa: event.target.value })}
              />
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
