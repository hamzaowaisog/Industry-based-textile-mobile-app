import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

const S = AppConstants.SCREENS.AUTH;

export type AuthStackParamList = {
  [S.WELCOME]: undefined;
  [S.ONBOARDING]: undefined;
  [S.LOGIN]: undefined;
  [S.FORGOT_PASSWORD]: undefined;
  [S.VERIFY_OTP]: { email: string; nextResendAt?: string };
  [S.RESET_PASSWORD]: { email: string; resetToken: string };
  [S.TERMS]: undefined;
  [S.PRIVACY]: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Clients: undefined;
  Products: undefined;
  Orders: undefined;
  Payments: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type ClientStackParamList = {
  ClientList: undefined;
  ClientDetail: { clientId: number };
  AddClient: undefined;
  EditClient: { clientId: number };
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
  AddProduct: undefined;
};

export type OrderStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: number };
  CreateOrder: undefined;
};

export type PaymentStackParamList = {
  PaymentList: undefined;
  RecordPayment: { clientId?: number };
};

export type ReportStackParamList = {
  ReportHome: undefined;
  ProfitLoss: undefined;
  ClientBalance: undefined;
  ClientBalanceDetail: { clientId: number };
};

// ── Generic nav/route prop helpers ───────────────────────────────────────────
export type AuthNavProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type AuthRouteProp<T extends keyof AuthStackParamList> =
  RouteProp<AuthStackParamList, T>;

// ── Per-screen nav prop aliases ───────────────────────────────────────────────
export type WelcomeNavProp = AuthNavProp<typeof S.WELCOME>;
export type OnboardingNavProp = AuthNavProp<typeof S.ONBOARDING>;
export type LoginNavProp = AuthNavProp<typeof S.LOGIN>;
export type ForgotPasswordNavProp = AuthNavProp<typeof S.FORGOT_PASSWORD>;
export type VerifyOtpNavProp = AuthNavProp<typeof S.VERIFY_OTP>;
export type ResetPasswordNavProp = AuthNavProp<typeof S.RESET_PASSWORD>;

// ── Per-screen route prop aliases ─────────────────────────────────────────────
export type VerifyOtpRouteProp = AuthRouteProp<typeof S.VERIFY_OTP>;
export type ResetPasswordRouteProp = AuthRouteProp<typeof S.RESET_PASSWORD>;
