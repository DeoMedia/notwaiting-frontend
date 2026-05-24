import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AFRICAN_COUNTRIES, type Country } from '../constants/countries';
import { SECTORS, type Sector } from '../constants/sectors';

export function useLocalizedCountries(): Country[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () =>
      AFRICAN_COUNTRIES.map((c) => ({
        value: c.value,
        label: t(`countries.list.${c.value}`, { defaultValue: c.label }),
      })),
    [t, i18n.language],
  );
}

export function useLocalizedCountriesWithPlaceholder(): Country[] {
  const { t } = useTranslation();
  const list = useLocalizedCountries();
  return useMemo(() => [{ value: '', label: t('countries.selectShort') }, ...list], [t, list]);
}

export function useLocalizedCountriesWithAll(): Country[] {
  const { t } = useTranslation();
  const list = useLocalizedCountries();
  return useMemo(() => [{ value: 'all', label: t('countries.all') }, ...list], [t, list]);
}

export function useLocalizedSectors(): Sector[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () =>
      SECTORS.map((s) => ({
        ...s,
        label: t(`sectors.${s.value}`, { defaultValue: s.label }),
      })),
    [t, i18n.language],
  );
}

export function useLocalizedSectorLabel(value: string): string {
  const { t } = useTranslation();
  return t(`sectors.${value}`, { defaultValue: value });
}
