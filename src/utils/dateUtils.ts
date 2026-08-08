export const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
export const MONTH_NAMES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
] as const;

/**
 * Parses an ISO date string (YYYY-MM-DD) into a native Date object at local midnight.
 */
export function parseIsoDate(isoString: string): Date {
  if (!isoString || !isoString.includes('-')) {
    return new Date();
  }
  const [year, month, day] = isoString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

/**
 * Formats a native Date object into an ISO date string (YYYY-MM-DD).
 */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a new Date shifted by the specified number of days (immutable).
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns the start of the week (Sunday) for a given date.
 */
export function getStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay();
  return addDays(date, -dayOfWeek);
}

/**
 * Formats a Date object into a readable date title (e.g. "Mon, 15 Aug 2026").
 */
export function getDateDisplayTitle(date: Date, locale: 'en' | 'es' = 'es'): string {
  const dayNames = locale === 'en' ? DAY_NAMES_EN : DAY_NAMES_ES;
  const monthNames = locale === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Formats a date range string for week view.
 */
export function getTimeRangeDisplay(startDate: Date, endDate: Date, locale: 'en' | 'es' = 'es'): string {
  const monthNames = locale === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  const startMonth = monthNames[startDate.getMonth()];
  const endMonth = monthNames[endDate.getMonth()];

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${startMonth}`;
  }
  return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth}`;
}

/**
 * Extracts normalized YYYY-MM-DD date from ISO date-time string.
 */
export function normalizeDateString(dateTimeString: string): string {
  if (!dateTimeString) return '';
  return dateTimeString.slice(0, 10);
}

/**
 * Extracts normalized HH:mm time from ISO date-time string.
 */
export function normalizeTimeString(dateTimeString: string): string {
  if (!dateTimeString || dateTimeString.length < 16) return '';
  return dateTimeString.slice(11, 16);
}
