function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm' }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-[#1F4E79]">{title}</h2>
        <div className="mt-2 text-sm text-gray-600">{children}</div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
