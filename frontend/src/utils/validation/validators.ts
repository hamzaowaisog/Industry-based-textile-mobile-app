import * as Yup from 'yup';

/**
 * String field that must parse to a number strictly greater than zero.
 * Use for money and quantities that can never be zero or negative
 * (payment amounts, order/purchase line qty & unit price/cost, expense amount).
 *
 * @param requiredMessage  i18n key shown when the field is empty.
 * @param positiveMessage  i18n key shown when the value is ≤ 0 or non-numeric.
 */
export const positiveDecimalString = (
  requiredMessage: string,
  positiveMessage: string,
): Yup.StringSchema<string> =>
  Yup.string()
    .required(requiredMessage)
    .test('is-positive', positiveMessage, (v) => {
      const n = parseFloat(v ?? '');
      return !Number.isNaN(n) && n > 0;
    });

/**
 * String field that must parse to zero or a positive number (required).
 * Use for values where 0 is a legitimate entry.
 *
 * @param requiredMessage      i18n key shown when the field is empty.
 * @param nonNegativeMessage   i18n key shown when the value is negative or non-numeric.
 */
export const nonNegativeDecimalString = (
  requiredMessage: string,
  nonNegativeMessage: string,
): Yup.StringSchema<string> =>
  Yup.string()
    .required(requiredMessage)
    .test('is-non-negative', nonNegativeMessage, (v) => {
      const n = parseFloat(v ?? '');
      return !Number.isNaN(n) && n >= 0;
    });

/**
 * Optional/nullable string field that, when filled, must parse to zero or a
 * positive number. Empty and null pass. Use for optional fields like a
 * client's credit limit.
 *
 * @param nonNegativeMessage  i18n key shown when the value is negative or non-numeric.
 */
export const optionalNonNegativeDecimalString = (
  nonNegativeMessage: string,
): Yup.StringSchema<string | undefined | null> =>
  Yup.string()
    .nullable()
    .test('is-non-negative', nonNegativeMessage, (v) => {
      if (!v || !v.trim()) return true;
      const n = parseFloat(v);
      return !Number.isNaN(n) && n >= 0;
    });
