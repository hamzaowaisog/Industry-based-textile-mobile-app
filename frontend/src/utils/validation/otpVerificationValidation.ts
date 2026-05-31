import * as Yup from 'yup';

export const otpVerificationValidationSchema = Yup.object({
  code: Yup.string()
    .required('Verification code is required')
    .length(6, 'Code must be exactly 6 digits')
    .matches(/^\d{6}$/, 'Code must be 6 numeric digits'),
});
