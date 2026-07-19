import * as Yup from 'yup';

import i18n from '@utils/i18n';

export const createUserValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(() => i18n.t('users.validationNameRequired')),
  email: Yup.string()
    .email(() => i18n.t('users.validationEmailInvalid'))
    .required(() => i18n.t('users.validationEmailRequired')),
  userName: Yup.string()
    .trim()
    .min(3, () => i18n.t('users.validationUserNameTooShort'))
    .required(() => i18n.t('users.validationUserNameRequired')),
  phoneNumber: Yup.string()
    .min(10, () => i18n.t('users.validationPhoneTooShort'))
    .max(15, () => i18n.t('users.validationPhoneTooLong'))
    .matches(/^[+\d\s\-()]*$/, () => i18n.t('users.validationPhoneInvalid'))
    .nullable(),
  password: Yup.string()
    .required(() => i18n.t('users.validationPasswordRequired'))
    .min(8, () => i18n.t('users.validationPasswordTooShort'))
    .matches(/[A-Z]/, () => i18n.t('users.validationPasswordUppercase'))
    .matches(/[0-9]/, () => i18n.t('users.validationPasswordNumber'))
    .matches(/[^A-Za-z0-9]/, () => i18n.t('users.validationPasswordSpecial')),
  confirmPassword: Yup.string()
    .required(() => i18n.t('users.validationConfirmPasswordRequired'))
    .oneOf([Yup.ref('password')], () => i18n.t('users.validationPasswordsMismatch')),
  roleId: Yup.number().required(),
});
