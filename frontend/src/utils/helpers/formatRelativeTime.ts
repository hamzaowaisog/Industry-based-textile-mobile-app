const MONTH_NUM: Record<string, string> = {
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

const parseDate = (s: string): Date => {
  const m = s.match(/^(\d{1,2})\s([A-Za-z]{3}),?\s(\d{4})$/);
  if (m) {
    const mon = MONTH_NUM[m[2]];
    if (mon) return new Date(`${m[3]}-${mon}-${m[1].padStart(2, '0')}T00:00:00.000Z`);
  }
  // API sends UTC ISO strings; treat timezone-less values as UTC for correct relative diff.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && !/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(`${s}Z`);
  }
  return new Date(s);
};

export const formatRelativeTime = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = parseDate(isoString);
  if (isNaN(date.getTime())) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
