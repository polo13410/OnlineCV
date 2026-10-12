import { SupportedLanguage } from '../../services/language.service';

// ISO dates are 'YYYY', 'YYYY-MM', 'YYYY-MM-DD' or full timestamps; all formatted in UTC
// so a bare date never shifts to the previous day.

function parse(iso: string): Date {
  return new Date(iso.length === 4 ? `${iso}-01-01` : iso);
}

function format(iso: string, lang: SupportedLanguage, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(lang, { ...options, timeZone: 'UTC' }).format(parse(iso));
}

/** 'Octobre 2026' — or just '2017' for a year-only date. */
export function formatMonthYear(iso: string, lang: SupportedLanguage): string {
  if (iso.length === 4) return iso;
  const s = format(iso, lang, { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** '8 octobre 2026' */
export function formatDay(iso: string, lang: SupportedLanguage): string {
  return format(iso, lang, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** 'oct. 2024 → Aujourd'hui', '2017 → 2020' */
export function formatPeriod(from: string, to: string | undefined, lang: SupportedLanguage, presentLabel: string): string {
  const short = (iso: string) => iso.length === 4 ? iso : format(iso, lang, { month: 'short', year: 'numeric' });
  return `${short(from)} → ${to ? short(to) : presentLabel}`;
}

/** Rounded to whole years ('1 an 9 mois' → '2 ans'); months only under a year ('6 mois'). An ongoing period runs until `now`. */
export function formatDuration(from: string, to: string | undefined, lang: SupportedLanguage, now = new Date()): string {
  const start = parse(from);
  const end = to ? parse(to) : now;
  const months = Math.max(1, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth());
  if (months < 12) {
    return lang === 'fr' ? `${months} mois` : `${months} mo${months > 1 ? 's' : ''}`;
  }
  const years = Math.round(months / 12);
  return lang === 'fr' ? `${years} an${years > 1 ? 's' : ''}` : `${years} yr${years > 1 ? 's' : ''}`;
}

/** Timeline meta for a dated experience: period (emphasised) then duration. */
export function periodMeta(from: string, to: string | undefined, lang: SupportedLanguage, presentLabel: string) {
  return [
    { value: formatPeriod(from, to, lang, presentLabel), emphasis: true },
    { value: formatDuration(from, to, lang) },
  ];
}
