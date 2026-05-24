import { Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../utils/clipboard';

interface ShareCardProps {
  title: string;
  description: string;
  caption: string;
}

export function ShareCard({ title, description, caption }: ShareCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(caption);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border-2 border-[#0C0C0A] p-6 flex flex-col">
      <h3 className="text-xl mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-sm mb-4 flex-grow">{description}</p>
      <div className="bg-[#F5F5F5] p-4 mb-4 border border-[#0C0C0A] text-sm font-mono">
        {caption}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0C0C0A] text-white hover:bg-[#000000] transition-colors"
      >
        <Copy size={16} />
        {copied ? t('common.copied') : t('common.copy')}
      </button>
    </div>
  );
}
