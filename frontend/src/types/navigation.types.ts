import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

const S = AppConstants.SCREENS.AUTH;

export type AuthStackParamList = {
  [S.WELCOME]: undefined;
  [S.ONBOARDING]: undefined;
  [S.LOGIN]: undefined;
  [S.FORGOT_PASSWORD]: undefined;
  [S.VERIFY_OTP]: { email: string; nextResendAt?: string };
  [S.RESET_PASSWORD]: { email: string; resetToken: string };
  [S.REGISTER]: undefined;
  [S.VERIFY_SIGNUP_OTP]: { email: string; nextResendAt?: string };
  [S.BIOMETRIC]: undefined;
  [S.TERMS]: undefined;
  [S.PRIVACY]: undefined;
};

// ── Stack param lists ──────────────────────────────────────────────────────────

export type ClientStackParamList = {
  ClientList: undefined;
  ClientDetail: { clientId: number };
  ClientForm: { clientId?: number };
};

export type OrderStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: number };
  CreateOrder: { clientId?: number; clientName?: string } | undefined;
  EditOrder: { orderId: number };
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
  ProductForm: { productId?: number };
};

export type PurchaseStackParamList = {
  PurchaseList: undefined;
  PurchaseDetail: { purchaseId: number };
  CreatePurchase: { supplierId?: number; supplierName?: string } | undefined;
  EditPurchase: { purchaseId: number };
};

export type PaymentStackParamList = {
  PaymentList: undefined;
  RecordPayment: { clientId?: number; clientName?: string };
};

export type InvoiceStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: number };
  InvoiceForm: { invoiceId?: number };
};

export type ExpenseStackParamList = {
  ExpenseList: undefined;
  AddExpense: undefined;
};

export type StockStackParamList = {
  StockMoveList: undefined;
  AddStockMove: undefined;
};

export type LedgerStackParamList = {
  TransactionList: undefined;
};

export type ReportStackParamList = {
  ReportsHub: undefined;
  ProfitLoss: undefined;
  ClientBalance: undefined;
  ClientBalanceDetail: { clientId: number };
  CreditDebit: undefined;
  SummaryReport: undefined;
};

export type UserStackParamList = {
  UserList: undefined;
  CreateUser: undefined;
};

// ── Main stack (wraps drawer + modal screens) ──────────────────────────────────

export type MainStackParamList = {
  DrawerRoot: NavigatorScreenParams<MainDrawerParamList>;
  More: undefined;
  NotificationCenter: undefined;
};

export type MainStackNavProp = NativeStackNavigationProp<MainStackParamList>;

// ── Drawer param list ──────────────────────────────────────────────────────────

export type MainDrawerParamList = {
  Dashboard: undefined;
  ClientsStack: NavigatorScreenParams<ClientStackParamList>;
  OrdersStack: NavigatorScreenParams<OrderStackParamList>;
  ProductsStack: NavigatorScreenParams<ProductStackParamList>;
  PurchasesStack: NavigatorScreenParams<PurchaseStackParamList>;
  PaymentsStack: NavigatorScreenParams<PaymentStackParamList>;
  InvoicesStack: NavigatorScreenParams<InvoiceStackParamList>;
  ExpensesStack: NavigatorScreenParams<ExpenseStackParamList>;
  StockStack: NavigatorScreenParams<StockStackParamList>;
  LedgerStack: NavigatorScreenParams<LedgerStackParamList>;
  ReportsStack: NavigatorScreenParams<ReportStackParamList>;
  UsersStack: NavigatorScreenParams<UserStackParamList>;
  Settings: undefined;
};

// ── Auth nav/route prop helpers ────────────────────────────────────────────────

export type AuthNavProp<T extends keyof AuthStackParamList> = NativeStackNavigationProp<
  AuthStackParamList,
  T
>;

export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;

// ── Per-screen nav prop aliases ────────────────────────────────────────────────

export type WelcomeNavProp = AuthNavProp<typeof S.WELCOME>;
export type OnboardingNavProp = AuthNavProp<typeof S.ONBOARDING>;
export type LoginNavProp = AuthNavProp<typeof S.LOGIN>;
export type ForgotPasswordNavProp = AuthNavProp<typeof S.FORGOT_PASSWORD>;
export type VerifyOtpNavProp = AuthNavProp<typeof S.VERIFY_OTP>;
export type ResetPasswordNavProp = AuthNavProp<typeof S.RESET_PASSWORD>;
export type RegisterNavProp = AuthNavProp<typeof S.REGISTER>;
export type VerifySignupOtpNavProp = AuthNavProp<typeof S.VERIFY_SIGNUP_OTP>;
export type BiometricNavProp = AuthNavProp<typeof S.BIOMETRIC>;

// ── Per-screen route prop aliases ──────────────────────────────────────────────

export type VerifyOtpRouteProp = AuthRouteProp<typeof S.VERIFY_OTP>;
export type ResetPasswordRouteProp = AuthRouteProp<typeof S.RESET_PASSWORD>;
export type VerifySignupOtpRouteProp = AuthRouteProp<typeof S.VERIFY_SIGNUP_OTP>;

// ── Purchase screen props ───────────────────────────────────────────────────────

export type PurchaseDetailScreenProps = NativeStackScreenProps<
  PurchaseStackParamList,
  typeof SM.PURCHASE_DETAIL
>;
export type CreatePurchaseScreenProps = NativeStackScreenProps<
  PurchaseStackParamList,
  typeof SM.CREATE_PURCHASE
>;
export type EditPurchaseScreenProps = NativeStackScreenProps<
  PurchaseStackParamList,
  typeof SM.EDIT_PURCHASE
>;

// ── Order screen props ──────────────────────────────────────────────────────────

const SM = AppConstants.SCREENS.MAIN;

export type CreateOrderScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  typeof SM.CREATE_ORDER
>;
export type OrderDetailScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  typeof SM.ORDER_DETAIL
>;
export type EditOrderScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  typeof SM.EDIT_ORDER
>;
