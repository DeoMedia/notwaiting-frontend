import { useTranslation } from 'react-i18next';

interface CharacterCountProps {
  current: number;
  limit: number;
}

export function CharacterCount({ current, limit }: CharacterCountProps) {
  const { t } = useTranslation();
  const percentage = (current / limit) * 100;
  
  return (
    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-xs text-gray-500">
        {current}/{limit} {t('contact.charactersSuffix')}
      </p>
      <div className="flex-1 max-w-[100px] h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-colors duration-200 ${
            percentage > 90 ? 'bg-[#dd3935]' : percentage > 70 ? 'bg-yellow-500' : 'bg-[#0C0C0A]'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
