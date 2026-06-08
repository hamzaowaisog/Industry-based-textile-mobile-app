export const AppConstants = {
  // App identity
  APP: {
    NAME: 'HamzaTex',
    TAG: 'TEXTILE ERP',
  },

  // Secure store keys (auth tokens only — non-sensitive prefs use FILES)
  SECURE_STORE: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    ROLE_ID: 'roleId',
    USER_NAME: 'userName',
    EMAIL: 'userEmail',
    BIOMETRIC_TOKEN: 'biometricToken',
    PUSH_TOKEN: 'push_token',
    NOTIFICATIONS_PROMPTED: 'notifications_prompted',
  },

  // File-system markers (cleared on reinstall, unlike Keychain)
  FILES: {
    ONBOARDING_COMPLETED: 'onboarding_completed',
  },

  // Roles
  ROLES: {
    ADMIN: 1,
    STAFF: 2,
  },

  // Client detail tabs
  CLIENT_TABS: {
    ORDERS: 'orders',
    PURCHASES: 'purchases',
    PAYMENTS: 'payments',
    INVOICES: 'invoices',
    TRANSACTIONS: 'transactions',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
  },

  // Sync
  SYNC: {
    MAX_RETRY_COUNT: 3,
    STORE_KEY: 'hamzatex-sync-store',
    SNAP_POINTS: ['62%'],
    PROGRESS: {
      INIT: 5,
      PUSHING: 20,
      CLEARING: 55,
      PULLING: 80,
      DONE: 100,
    },
    PHASES: {
      PUSHING: 'pushing',
      CLEARING: 'clearing',
      PULLING: 'pulling',
    } as const,
  },

  // Local DB
  DB: {
    NAME: 'hamzatex.db',
  },

  // Currency display
  CURRENCY: {
    PREFIX: 'Rs ',
  },

  // Locale
  LOCALE: {
    DATE: 'en-US' as const,
  },

  // Date format
  DATE_FORMAT: 'dd MMM, yyyy',

  // OTP
  OTP: {
    LENGTH: 6,
  },

  // Screen names
  SCREENS: {
    AUTH: {
      WELCOME: 'Welcome',
      ONBOARDING: 'Onboarding',
      LOGIN: 'Login',
      FORGOT_PASSWORD: 'ForgotPassword',
      VERIFY_OTP: 'VerifyOtp',
      RESET_PASSWORD: 'ResetPassword',
      REGISTER: 'Register',
      VERIFY_SIGNUP_OTP: 'VerifySignupOtp',
      BIOMETRIC: 'Biometric',
      TERMS: 'Terms',
      PRIVACY: 'Privacy',
    },
    MAIN: {
      // Drawer-level routes
      DASHBOARD: 'Dashboard',
      CLIENTS_STACK: 'ClientsStack',
      ORDERS_STACK: 'OrdersStack',
      PRODUCTS_STACK: 'ProductsStack',
      PURCHASES_STACK: 'PurchasesStack',
      PAYMENTS_STACK: 'PaymentsStack',
      INVOICES_STACK: 'InvoicesStack',
      EXPENSES_STACK: 'ExpensesStack',
      STOCK_STACK: 'StockStack',
      LEDGER_STACK: 'LedgerStack',
      REPORTS_STACK: 'ReportsStack',
      USERS_STACK: 'UsersStack',
      SETTINGS: 'Settings',
      MORE: 'More',
      NOTIFICATION_CENTER: 'NotificationCenter',
      // Client stack
      CLIENT_LIST: 'ClientList',
      CLIENT_DETAIL: 'ClientDetail',
      CLIENT_FORM: 'ClientForm',
      // Order stack
      ORDER_LIST: 'OrderList',
      ORDER_DETAIL: 'OrderDetail',
      CREATE_ORDER: 'CreateOrder',
      // Product stack
      PRODUCT_LIST: 'ProductList',
      PRODUCT_DETAIL: 'ProductDetail',
      PRODUCT_FORM: 'ProductForm',
      // Purchase stack
      PURCHASE_LIST: 'PurchaseList',
      PURCHASE_DETAIL: 'PurchaseDetail',
      CREATE_PURCHASE: 'CreatePurchase',
      // Payment stack
      PAYMENT_LIST: 'PaymentList',
      RECORD_PAYMENT: 'RecordPayment',
      // Invoice stack
      INVOICE_LIST: 'InvoiceList',
      INVOICE_DETAIL: 'InvoiceDetail',
      INVOICE_FORM: 'InvoiceForm',
      // Expense stack
      EXPENSE_LIST: 'ExpenseList',
      ADD_EXPENSE: 'AddExpense',
      // Stock stack
      STOCK_MOVE_LIST: 'StockMoveList',
      ADD_STOCK_MOVE: 'AddStockMove',
      // Ledger stack
      TRANSACTION_LIST: 'TransactionList',
      // Report stack
      REPORTS_HUB: 'ReportsHub',
      PROFIT_LOSS: 'ProfitLoss',
      CLIENT_BALANCE: 'ClientBalance',
      CLIENT_BALANCE_DETAIL: 'ClientBalanceDetail',
      CREDIT_DEBIT: 'CreditDebit',
      SUMMARY_REPORT: 'SummaryReport',
      // User stack
      USER_LIST: 'UserList',
      CREATE_USER: 'CreateUser',
    },
  } as const,

  NOTIFICATION_TYPES: {
    ORDER_CREATED: 'order_created',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',
    PURCHASE_DELIVERED: 'purchase_delivered',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_PAID: 'payment_paid',
    PAYMENT_REVERSED: 'payment_reversed',
    INVOICE_ISSUED: 'invoice_issued',
    INVOICE_OVERDUE: 'invoice_overdue',
    LOW_STOCK: 'low_stock',
    EXPENSE_APPROVED: 'expense_approved',
    SYNC_COMPLETE: 'sync_complete',
    SYNC_PARTIAL: 'sync_partial',
    SYNC_FAILED: 'sync_failed',
  },
} as const;
