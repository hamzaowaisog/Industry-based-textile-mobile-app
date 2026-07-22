export const getHijriDisplay = (
  hijriDisplay: string | null | undefined,
  fallback: string,
): string => hijriDisplay ?? fallback;

export const getCurrentHijriYear = (): number => {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic', { year: 'numeric' }).formatToParts(
    new Date(),
  );
  const yearPart = parts.find((p) => p.type === 'year')?.value;
  return yearPart ? parseInt(yearPart, 10) : new Date().getFullYear();
};
