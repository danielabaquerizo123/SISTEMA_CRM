type StatusMessageProps = {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyText?: string;
};

export function StatusMessage({
  loading,
  error,
  empty,
  emptyText = "No hay datos para mostrar.",
}: StatusMessageProps) {
  if (loading) {
    return <p className="status-text">Cargando...</p>;
  }

  if (error) {
    return <p className="status-text status-error">{error}</p>;
  }

  if (empty) {
    return <p className="status-text">{emptyText}</p>;
  }

  return null;
}
