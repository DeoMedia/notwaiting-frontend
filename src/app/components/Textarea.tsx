import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, name, ...props }: TextareaProps) {
  const inputId = id ?? name
  const borderClass = error ? 'border-[#dd3935]' : 'border-[#0C0C0A]'
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-base font-bold uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={`w-full px-4 py-3 bg-[#F5F5F5] border ${borderClass} focus:outline-none focus:ring-2 focus:ring-[#dd3935] resize-none ${className}`}
        {...props}
      />
      {error && (
        <p id={inputId ? `${inputId}-error` : undefined} className="mt-1 text-xs font-mono text-[#dd3935]">
          {error}
        </p>
      )}
    </div>
  );
}
