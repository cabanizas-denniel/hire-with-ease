import { useState } from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

/**
 * Password input with a built-in show/hide toggle.
 * Drop-in replacement for a plain <input type="password"> — accepts the
 * same props (value, onChange, placeholder, autoComplete, required, id, name).
 */
function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
  required = false,
  id,
  name,
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        id={id}
        name={name}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-base ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        title={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-gray-400 hover:text-[#1F4E79] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-1 cursor-pointer"
      >
        {visible ? (
          <HiOutlineEyeSlash className="h-5 w-5" aria-hidden="true" />
        ) : (
          <HiOutlineEye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
