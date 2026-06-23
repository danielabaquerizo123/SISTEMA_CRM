import { Edit3, Plus, Search, Trash2 } from "lucide-react";
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
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Contactos</span>
          <h1>Clientes</h1>
        </div>
        <button className="primary-button" type="button" onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por nombre o correo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <section className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.correo}</td>
                  <td>{cliente.empresa ?? "Sin empresa"}</td>
                  <td>
                    <span className="badge">{cliente.estado}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => openEditModal(cliente)}
                        aria-label={`Editar ${cliente.nombre}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => handleDelete(cliente)}
                        aria-label={`Eliminar ${cliente.nombre}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <StatusMessage
            empty={filteredClientes.length === 0}
            emptyText="No hay clientes con ese criterio."
          />
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
