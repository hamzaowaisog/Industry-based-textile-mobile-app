import * as Yup from 'yup';

import i18n from '@utils/i18n';

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
  creditLimit: Yup.string().nullable(),
  openingBalance: Yup.string().nullable(),
  notes: Yup.string().nullable(),
});
