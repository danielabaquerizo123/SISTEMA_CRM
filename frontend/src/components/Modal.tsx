import { X } from "lucide-react";
import type { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  title: string;
  onClose: () => void;
}>;

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
