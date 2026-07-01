const niceStep = (rawStep: number): number => {
  if (rawStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** Math.max(0, exponent);
  const fraction = rawStep / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
};

export const computeNiceMaxValue = (peak: number, headroom: number, sections: number): number =>
  niceStep((peak * headroom) / sections) * sections;
