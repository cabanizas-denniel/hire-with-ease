import { useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

/**
 * Lightweight modal shell used by the verification flows.
 * The existing Modal.jsx is locked to a confirm/cancel layout; our
 * verification screens need custom footers (multi-step OTP, uploads, etc.)
 * so this is a more flexible primitive.
 */
function ModalShell({ isOpen, title, subtitle, children, onClose, footer, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const width =
    size === 'lg' ? 'max-w-xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div
        className={`flex max-h-[min(92dvh,44rem)] w-full ${width} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1F4E79]">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-700">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ModalShell;
