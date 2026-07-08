export const AppConstants = {
  // App identity
  APP: {
    NAME: 'HamzaTex',
    TAG: 'TEXTILE ERP',
    CURRENCY: 'Rs',
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

  // Meta lookup keys — use with useMetaStore().getList() / getLookupName()
  META: {
    ORDER_STATUSES: 'orderStatuses',
    PURCHASE_STATUSES: 'purchaseStatuses',
    PAYMENT_TYPES: 'paymentTypes',
    PAYMENT_DIRECTIONS: 'paymentDirections',
    TRANS_TYPES: 'transTypes',
    TRANS_MODES: 'transModes',
    TRANS_CATEGORIES: 'transCategories',
    EXPENSE_TYPES: 'expenseTypes',
    MOVEMENT_TYPES: 'movementTypes',
    MOVEMENT_SOURCES: 'movementSources',
    CLIENT_TYPES: 'clientTypes',
    USER_ROLES: 'userRoles',
    INVOICE_STATUSES: 'invoiceStatuses',
    UNITS: 'units',
  } as const,

  // Client type IDs (matches backend seeded ClientType table)
  CLIENT_TYPE: {
    CUSTOMER: 1,
    SUPPLIER: 2,
  },

  // Movement type IDs (matches backend seeded MovementType table)
  MOVEMENT_TYPE: {
    IN: 1,
    OUT: 2,
    ADJUSTMENT: 3,
  },

  // Movement source IDs (matches backend MovementSource: 1=Purchase, 2=Sale, 3=Manual)
  MOVEMENT_SOURCE: {
    PURCHASE: 1,
    SALE: 2,
    MANUAL: 3,
  },

  // Payment type IDs (matches backend seeded PaymentType table)
  PAYMENT_TYPE: {
    CASH: 1,
    CREDIT: 2,
  },

  // Payment direction IDs (matches backend seeded PaymentDirection table)
  PAYMENT_DIRECTION: {
    RECEIVED: 1,
    PAID: 2,
    ADJUSTMENT: 3,
  },

  // Transaction mode IDs (matches backend seeded TransMode table)
  TRANS_MODE: {
    CASH: 1,
    BANK: 2,
    CREDIT: 3,
  },

  // Order status IDs (matches backend seeded OrderStatus table)
  ORDER_STATUS: {
    PENDING: 1,
    IN_PROGRESS: 2,
    DELIVERED: 3,
    CANCELLED: 4,
  },

  // Purchase status IDs (matches backend seeded PurchaseStatus table — same values as ORDER_STATUS)
  PURCHASE_STATUS: {
    PENDING: 1,
    IN_PROGRESS: 2,
    DELIVERED: 3,
    CANCELLED: 4,
  },

  // Invoice status IDs (matches backend seeded InvoiceStatus table)
  INVOICE_STATUS: {
    DRAFT: 1,
    ISSUED: 2,
    PAID: 3,
    CANCELLED: 4,
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
  DATE: {
    ISO_DATE_STRING_LENGTH: 10,
  },

  // HTTP status codes & protocol constants
  HTTP: {
    OK: 200,
    UNAUTHORIZED: 401,
    METHOD: {
      GET: 'GET',
    },
    HEADER_AUTHORIZATION: 'Authorization',
    AUTH_SCHEME: 'Bearer ',
  },

  // Platform identifiers & Android API levels
  PLATFORM: {
    OS: {
      IOS: 'ios',
      ANDROID: 'android',
    },
    ANDROID_API: {
      POST_NOTIFICATIONS: 33,
    },
  },

  // OTP
  OTP: {
    LENGTH: 6,
    RESEND_COOLDOWN_SECONDS: 30,
  },

  // Compact number formatting thresholds
  NUMBER: {
    THOUSAND: 1000,
    MILLION: 1000000,
    DECIMALS_COMPACT: 1,
    DECIMALS_ROUND: 0,
  },

  // Name initials
  INITIALS: {
    MAX_LENGTH: 2,
  },

  // Biometric screen pulse-ring animation
  BIOMETRIC: {
    RING_COUNT: 3,
    RING_STAGGER_DELAYS: [0, 0.4, 0.8],
    RING_DURATION_MS: 2000,
    RING_SCALE_MAX: 1.08,
    RING_OPACITY_MAX: 0.4,
    RING_OPACITY_MIN: 0.15,
  },

  // Order create/edit wizard steps
  ORDER_WIZARD: {
    STEP_CLIENT: 0,
    STEP_PRODUCTS: 1,
    STEP_REVIEW: 2,
    TOTAL_STEPS: 3,
  },

  // Purchase create/edit wizard steps
  PURCHASE_WIZARD: {
    STEP_SUPPLIER: 0,
    STEP_PRODUCTS: 1,
    STEP_REVIEW: 2,
    TOTAL_STEPS: 3,
  },

  // Product detail
  PRODUCT: {
    RECENT_MOVEMENTS: 4,
  },

  // Dashboard list previews
  DASHBOARD: {
    RECENT_ITEMS: 3,
  },

  // Skeleton loaders
  SKELETON: {
    PULSE_DURATION_MS: 700,
    PULSE_MIN_OPACITY: 0.4,
    DETAIL_PLACEHOLDER_COUNT: 6,
    LIST_PLACEHOLDER_COUNT: 5,
    CLIENT_INFO_ROWS: 4,
    CLIENT_TAB_PILLS: 4,
    CLIENT_TAB_ROWS: 3,
    DASHBOARD_STAT_CARDS: 4,
    DASHBOARD_RECENT_ORDERS: 3,
    ORDER_STAT_CARDS: 3,
    ORDER_PROGRESS_NODES: 3,
    ORDER_LINE_ITEMS: 3,
  },

  // Client detail tab content layout
  TAB_CONTENT: {
    MIN_HEIGHT: 240,
    HEIGHT_RATIO: 0.4,
  },

  // Time constants (seconds)
  TIME: {
    MS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    SECONDS_PER_HOUR: 3600,
    SECONDS_PER_DAY: 86400,
  },

  // Stock chart display config
  CHART: {
    Y_AXIS_LABEL_WIDTH: 40,
    HEIGHT: 120,
    SECTIONS: 5,
    INITIAL_SPACING: 8,
    END_SPACING: 8,
    DATA_POINT_RADIUS: 4,
    ANIMATION_DURATION_MS: 600,
    START_OPACITY: 0.28,
    Y_HEADROOM_EMPTY: 1.25,
    Y_HEADROOM_NORMAL: 1.12,
    FALLBACK_MAX: 4,
  },
  DONUT: {
    SIZE: 84,
    STROKE_WIDTH: 12,
    START_ROTATION_DEGREES: -90,
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
      EDIT_ORDER: 'EditOrder',
      // Product stack
      PRODUCT_LIST: 'ProductList',
      PRODUCT_DETAIL: 'ProductDetail',
      PRODUCT_FORM: 'ProductForm',
      // Purchase stack
      PURCHASE_LIST: 'PurchaseList',
      PURCHASE_DETAIL: 'PurchaseDetail',
      CREATE_PURCHASE: 'CreatePurchase',
      EDIT_PURCHASE: 'EditPurchase',
      // Payment stack
      PAYMENT_LIST: 'PaymentList',
      PAYMENT_DETAIL: 'PaymentDetail',
      RECORD_PAYMENT: 'RecordPayment',
      EDIT_PAYMENT: 'EditPayment',
      // Invoice stack
      INVOICE_LIST: 'InvoiceList',
      INVOICE_DETAIL: 'InvoiceDetail',
      CREATE_INVOICE: 'CreateInvoice',
      EDIT_INVOICE: 'EditInvoice',
      // Expense stack
      EXPENSE_LIST: 'ExpenseList',
      EXPENSE_DETAIL: 'ExpenseDetail',
      ADD_EXPENSE: 'AddExpense',
      EDIT_EXPENSE: 'EditExpense',
      // Stock stack
      STOCK_MOVE_LIST: 'StockMoveList',
      STOCK_MOVE_DETAIL: 'StockMoveDetail',
      ADD_STOCK_MOVE: 'AddStockMove',
      EDIT_STOCK_MOVE: 'EditStockMove',
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

  // PDF download
  PDF: {
    MIME_TYPE: 'application/pdf',
    ANDROID_CHOOSER_TITLE: 'Open PDF',
    SHARE_TITLE: 'Share invoice',
    FILE_URL_SCHEME: 'file://',
    ERROR: {
      NO_APP: 'no_pdf_app',
      CANNOT_PREVIEW: 'cannot_preview',
    },
    ERROR_CODE: {
      NO_APP: 'ENOAPP',
      CANNOT_PREVIEW: 'EINVAL',
    },
    MESSAGE: {
      NOT_AUTHENTICATED: 'Not authenticated',
      DOWNLOAD_FAILED: 'Download failed',
      UNKNOWN_ERROR: 'Unknown error',
      SHARE_FAILED: 'Could not share the PDF',
    },
    PATHS: {
      CLIENT_LIST: 'Client/pdf',
      ORDER_LIST: 'Order/pdf',
      PRODUCT_LIST: 'Product/pdf',
      PURCHASE_LIST: 'Purchase/pdf',
      PAYMENT_LIST: 'Payment/pdf',
      INVOICE_LIST: 'Invoice/pdf',
      EXPENSE_LIST: 'Expense/pdf',
      STOCK_MOVEMENT_LIST: 'StockMovements/pdf',
      clientDossier: (id: number) => `Client/${id}/pdf`,
      orderDossier: (id: number) => `Order/${id}/pdf`,
      productDossier: (id: number) => `Product/${id}/pdf`,
      purchaseDossier: (id: number) => `Purchase/${id}/pdf`,
      paymentDossier: (id: number) => `Payment/${id}/pdf`,
      invoiceDossier: (id: number) => `Invoice/${id}/pdf`,
      expenseDossier: (id: number) => `Expense/${id}/pdf`,
      stockMovementDossier: (id: number) => `StockMovements/${id}/pdf`,
    },
    FILENAMES: {
      CLIENT_LIST: 'clients.pdf',
      ORDER_LIST: 'orders.pdf',
      PRODUCT_LIST: 'products.pdf',
      PURCHASE_LIST: 'purchases.pdf',
      PAYMENT_LIST: 'payments.pdf',
      INVOICE_LIST: 'invoices.pdf',
      EXPENSE_LIST: 'expenses.pdf',
      STOCK_MOVEMENT_LIST: 'stock-movements.pdf',
      clientDossier: (id: number) => `client-${id}.pdf`,
      orderDossier: (id: number) => `order-${id}.pdf`,
      productDossier: (id: number) => `product-${id}.pdf`,
      purchaseDossier: (id: number) => `purchase-${id}.pdf`,
      paymentDossier: (id: number) => `payment-${id}.pdf`,
      invoiceDossier: (id: number) => `invoice-${id}.pdf`,
      expenseDossier: (id: number) => `expense-${id}.pdf`,
      stockMovementDossier: (id: number) => `stock-movement-${id}.pdf`,
    },
  },

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
  },
} as const;
