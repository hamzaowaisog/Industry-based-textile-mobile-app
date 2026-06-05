export const secondsUntil = (isoString?: string): number => {
  if (!isoString) return 0;
  const diff = Math.floor((new Date(isoString).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};
