import * as Yup from 'yup';

// ── Frontend validation ──────────────────────────────────────────────────────

export const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// ── Backend error mapping ────────────────────────────────────────────────────
// e.g. { Email: 'email' }
