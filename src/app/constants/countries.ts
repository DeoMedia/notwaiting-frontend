export interface Country {
  value: string
  label: string
}

export const AFRICAN_COUNTRIES: Country[] = [
  { value: 'algeria',                  label: 'Algeria' },
  { value: 'angola',                   label: 'Angola' },
  { value: 'benin',                    label: 'Benin' },
  { value: 'botswana',                 label: 'Botswana' },
  { value: 'burkina-faso',             label: 'Burkina Faso' },
  { value: 'burundi',                  label: 'Burundi' },
  { value: 'cabo-verde',               label: 'Cabo Verde' },
  { value: 'cameroon',                 label: 'Cameroon' },
  { value: 'central-african-republic', label: 'Central African Republic' },
  { value: 'chad',                     label: 'Chad' },
  { value: 'comoros',                  label: 'Comoros' },
  { value: 'congo-brazzaville',        label: 'Congo (Brazzaville)' },
  { value: 'congo-kinshasa',           label: 'Congo (Kinshasa)' },
  { value: 'cote-divoire',             label: "Côte d'Ivoire" },
  { value: 'djibouti',                 label: 'Djibouti' },
  { value: 'egypt',                    label: 'Egypt' },
  { value: 'equatorial-guinea',        label: 'Equatorial Guinea' },
  { value: 'eritrea',                  label: 'Eritrea' },
  { value: 'eswatini',                 label: 'Eswatini' },
  { value: 'ethiopia',                 label: 'Ethiopia' },
  { value: 'gabon',                    label: 'Gabon' },
  { value: 'gambia',                   label: 'Gambia' },
  { value: 'ghana',                    label: 'Ghana' },
  { value: 'guinea',                   label: 'Guinea' },
  { value: 'guinea-bissau',            label: 'Guinea-Bissau' },
  { value: 'kenya',                    label: 'Kenya' },
  { value: 'lesotho',                  label: 'Lesotho' },
  { value: 'liberia',                  label: 'Liberia' },
  { value: 'libya',                    label: 'Libya' },
  { value: 'madagascar',               label: 'Madagascar' },
  { value: 'malawi',                   label: 'Malawi' },
  { value: 'mali',                     label: 'Mali' },
  { value: 'mauritania',               label: 'Mauritania' },
  { value: 'mauritius',                label: 'Mauritius' },
  { value: 'morocco',                  label: 'Morocco' },
  { value: 'mozambique',               label: 'Mozambique' },
  { value: 'namibia',                  label: 'Namibia' },
  { value: 'niger',                    label: 'Niger' },
  { value: 'nigeria',                  label: 'Nigeria' },
  { value: 'rwanda',                   label: 'Rwanda' },
  { value: 'sao-tome-and-principe',    label: 'São Tomé and Príncipe' },
  { value: 'senegal',                  label: 'Senegal' },
  { value: 'seychelles',               label: 'Seychelles' },
  { value: 'sierra-leone',             label: 'Sierra Leone' },
  { value: 'somalia',                  label: 'Somalia' },
  { value: 'south-africa',             label: 'South Africa' },
  { value: 'south-sudan',              label: 'South Sudan' },
  { value: 'sudan',                    label: 'Sudan' },
  { value: 'tanzania',                 label: 'Tanzania' },
  { value: 'togo',                     label: 'Togo' },
  { value: 'tunisia',                  label: 'Tunisia' },
  { value: 'uganda',                   label: 'Uganda' },
  { value: 'western-sahara',           label: 'Western Sahara' },
  { value: 'zambia',                   label: 'Zambia' },
  { value: 'zimbabwe',                 label: 'Zimbabwe' },
  { value: 'diaspora',                 label: 'African Diaspora' },
  { value: 'global',                   label: 'Global Supporter' },
]

// Prefixed with a blank "select" option — used in sign-on form dropdowns
export const AFRICAN_COUNTRIES_WITH_PLACEHOLDER: Country[] = [
  { value: '', label: 'Select country' },
  ...AFRICAN_COUNTRIES,
]

// Prefixed with "all" — used in Stories filter dropdown
export const AFRICAN_COUNTRIES_WITH_ALL: Country[] = [
  { value: 'all', label: 'All Countries' },
  ...AFRICAN_COUNTRIES,
]
