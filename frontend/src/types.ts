export type Cliente = {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string | null;
  empresa?: string | null;
  estado: string;
  createdAt: string;
};

export type Oportunidad = {
  id: number;
  titulo: string;
  descripcion?: string | null;
  valor: string | number;
  estado: EstadoOportunidad;
  clienteId: number;
  cliente?: Cliente;
  createdAt: string;
};

export type Actividad = {
  id: number;
  titulo: string;
  tipo: string;
  fecha: string;
  clienteId: number;
  cliente?: Cliente;
};

export type EstadoOportunidad =
  | "prospecto"
  | "contactado"
  | "negociacion"
  | "ganado"
  | "perdido";
