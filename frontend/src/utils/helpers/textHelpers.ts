export const getInitials = (name: string): string =>
  name.trim().substring(0, 2).toUpperCase();
