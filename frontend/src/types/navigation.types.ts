export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string; email: string };
  Terms: undefined;
  Privacy: undefined;
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
