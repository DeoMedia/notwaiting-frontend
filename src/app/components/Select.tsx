import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, name, ...props }: SelectProps) {
  const inputId = id ?? name
  const borderClass = error ? 'border-[#dd3935]' : 'border-[#0C0C0A]'
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-base font-bold uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <select
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={`w-full px-4 py-3 bg-[#F5F5F5] border ${borderClass} focus:outline-none focus:ring-2 focus:ring-[#dd3935] cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={inputId ? `${inputId}-error` : undefined} className="mt-1 text-xs font-mono text-[#dd3935]">
          {error}
        </p>
      )}
    </div>
  );
}
