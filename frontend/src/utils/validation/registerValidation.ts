import * as Yup from 'yup';

export const registerValidationSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  userName: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d+$/, 'Phone number must contain digits only')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be at most 20 digits'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters required')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[A-Z]/, 'Must contain at least one capital letter')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
});
