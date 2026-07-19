import * as Yup from 'yup';

export const changePasswordValidationSchema = Yup.object({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters required')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[A-Z]/, 'Must contain at least one capital letter')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
    .notOneOf([Yup.ref('oldPassword')], 'New password must be different from current password'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});
