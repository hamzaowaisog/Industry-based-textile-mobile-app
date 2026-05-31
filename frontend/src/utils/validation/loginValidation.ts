import * as Yup from 'yup';

// ── Frontend validation ──────────────────────────────────────────────────────

export const loginValidationSchema = Yup.object({
  userName: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

// ── Backend error mapping ────────────────────────────────────────────────────
// Map server-side field names to formik field keys if needed in the future.
// e.g. { UserName: 'userName', Password: 'password' }
