import * as Yup from 'yup';

import i18n from '@utils/i18n';

export const positiveDecimalString = (
  requiredMessage: string,
  positiveMessage: string,
): Yup.StringSchema<string> =>
  Yup.string()
    .required(() => i18n.t(requiredMessage))
    .test(
      'is-positive',
      () => i18n.t(positiveMessage),
      (v) => {
        const n = parseFloat(v ?? '');
        return !Number.isNaN(n) && n > 0;
      },
    );

export const nonNegativeDecimalString = (
  requiredMessage: string,
  nonNegativeMessage: string,
): Yup.StringSchema<string> =>
  Yup.string()
    .required(() => i18n.t(requiredMessage))
    .test(
      'is-non-negative',
      () => i18n.t(nonNegativeMessage),
      (v) => {
        const n = parseFloat(v ?? '');
        return !Number.isNaN(n) && n >= 0;
      },
    );

export const optionalSignedDecimalString = (
  invalidMessage: string,
): Yup.StringSchema<string | undefined | null> =>
  Yup.string()
    .nullable()
    .test(
      'is-number',
      () => i18n.t(invalidMessage),
      (v) => {
        if (!v || !v.trim()) return true;
        return !Number.isNaN(parseFloat(v)) && /^-?\d*\.?\d+$/.test(v.trim());
      },
    );

export const optionalNonNegativeDecimalString = (
  nonNegativeMessage: string,
): Yup.StringSchema<string | undefined | null> =>
  Yup.string()
    .nullable()
    .test(
      'is-non-negative',
      () => i18n.t(nonNegativeMessage),
      (v) => {
        if (!v || !v.trim()) return true;
        const n = parseFloat(v);
        return !Number.isNaN(n) && n >= 0;
      },
    );
