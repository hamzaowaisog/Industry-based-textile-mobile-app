import * as Yup from 'yup';

import i18n from '@utils/i18n';

import { optionalNonNegativeDecimalString, optionalSignedDecimalString } from './validators';

export const clientValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(() => i18n.t('clients.validationNameRequired'))
    .min(2, () => i18n.t('clients.validationNameTooShort')),
  phone: Yup.string()
    .min(10, () => i18n.t('clients.validationPhoneTooShort'))
    .max(15, () => i18n.t('clients.validationPhoneTooLong'))
    .matches(/^[+\d\s\-()]*$/, () => i18n.t('clients.validationPhoneInvalid'))
    .nullable(),
  address: Yup.string().nullable(),
  creditLimit: optionalNonNegativeDecimalString('clients.validationCreditLimitNegative'),
  openingBalance: optionalSignedDecimalString('clients.validationOpeningBalanceInvalid'),
  notes: Yup.string().nullable(),
});
