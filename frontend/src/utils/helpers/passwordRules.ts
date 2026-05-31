import { PasswordRule } from '../../types/resetPassword.types';

export const PASSWORD_RULES: PasswordRule[] = [
  { labelKey: 'resetPassword.minLength', met: (pw) => pw.length >= 8 },
  { labelKey: 'resetPassword.requireCapital', met: (pw) => /[A-Z]/.test(pw) },
  { labelKey: 'resetPassword.requireNumber', met: (pw) => /[0-9]/.test(pw) },
  { labelKey: 'resetPassword.requireSpecial', met: (pw) => /[^A-Za-z0-9]/.test(pw) },
];
