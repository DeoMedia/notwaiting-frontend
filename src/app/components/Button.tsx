import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = 'primary', children, loading, className = '', ...props }: ButtonProps) {
  const { t } = useTranslation();
  const baseClasses = 'px-8 py-4 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[#dd3935] text-white hover:bg-[#AA0000] active:bg-[#880000]',
    secondary: 'bg-transparent text-[#0C0C0A] border-2 border-[#0C0C0A] hover:bg-[#0C0C0A] hover:text-white active:bg-[#000000]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? t('common.loading') : children}
    </button>
  );
}
