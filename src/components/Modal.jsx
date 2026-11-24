function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmDisabled = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--hwe-slate)]/45 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hwe-modal-title"
        className="max-h-[min(90dvh,32rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--hwe-border)] bg-[var(--hwe-surface)] p-5 shadow-[var(--hwe-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="hwe-modal-title"
          className="text-lg font-semibold text-[var(--hwe-slate)]"
        >
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-[var(--hwe-muted)]">{children}</div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary w-full">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="btn-primary w-full"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
