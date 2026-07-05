import { AppConstants } from '@constants/appConstants';

const { ISO_DATE_STRING_LENGTH } = AppConstants.DATE;

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export const toISODate = (date: string | null | undefined): string | null => {
  if (!date) return null;

  // Already ISO format (YYYY-MM-DD or starts with year)
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, ISO_DATE_STRING_LENGTH);

  // "dd MMM, yyyy" format → "yyyy-MM-dd"
  const match = date.match(/^(\d{1,2})\s+(\w{3}),?\s+(\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = MONTH_MAP[match[2]];
    const year = match[3];
    if (month) return `${year}-${month}-${day}`;
  }

  // Fallback: try native Date parsing
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, ISO_DATE_STRING_LENGTH);

  return date;
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const formatDateForDisplay = (date: string | null | undefined): string => {
  const iso = toISODate(date);
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month - 1]}, ${year}`;
};

export const localDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthRange = (): { from: string; to: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return { from: `${year}-${month}-01`, to: `${year}-${month}-${day}` };
};
