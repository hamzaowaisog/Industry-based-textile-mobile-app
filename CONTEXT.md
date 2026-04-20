# HamzaTex — Project Context & Frontend Roadmap

> Paste this file at the start of any new chat session so the assistant has full context.

---

## 1. What This Project Is

**HamzaTex** is an ERP mobile app for a textile trading/distribution business. It tracks:
- Sales orders to customers
- Purchases from suppliers
- Payments (inbound from customers, outbound to suppliers)
- Inventory (stock movements, weighted average cost)
- Financial reporting (monthly P&L, client balances, credit/debit summaries)

**Stack:**
- **Frontend:** React Native (Expo) + Zustand + Orval (auto-generated Axios clients from Swagger) — located in `frontend/`
- **Backend:** ASP.NET Core (.NET) + MySQL + EF Core — located in `backend/HamzaTex.Api/`
- Both live in the same repo root

---

## 2. Backend — What's Already Built (Complete ✅)

### Auth
- JWT-based authentication
- Roles: `Admin`, `Staff`
- Controllers use `GetUserId()` helper and `[AdminOnly]` / `[AdminOrStaff]` / `[Authenticated]` policies
- Auth token must be sent as `Authorization: Bearer <token>` header

### Orders (Sales) ✅
Selling to customers (`Client` with `ClientTypeId = 1`).

**Endpoints:**
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/Order` | AdminOrStaff |
| GET | `/api/Order` | AdminOnly (paginated) |
| GET | `/api/Order/me` | Authenticated (staff-scoped) |
| GET | `/api/Order/{id}` | Authenticated |
| GET | `/api/Order/filtered` | Authenticated |
| PUT | `/api/Order/{id}` | AdminOrStaff |
| DELETE | `/api/Order/{id}` | AdminOnly |
| GET | `/api/Order/pdf` | AdminOrStaff |

**Order fields:** `id`, `clientId`, `clientName`, `statusId`, `statusName`, `paymentTypeId`, `paymentTypeName`, `orderDate`, `notes`, `createdAt`, `total`, `orderLines[]`, `amountPaid`, `outstanding`, `paymentStatus`

**OrderLine fields:** `id`, `orderId`, `productId`, `productName`, `qty` (decimal), `unitPrice` (decimal)

**Status IDs (OrderStatus):** 1=Pending, 2=InProgressed, 3=Delivered, 4=Cancelled

**Business rules:**
- Stock Out + ledger posting happen on transition to **Delivered**
- Cancelling after Delivered reverses stock and posts a compensating transaction
- `ClientId` must be a Customer (ClientTypeId=1)

### Purchases (Procurement) ✅
Buying from suppliers (`Client` with `ClientTypeId = 2`).

**Endpoints:**
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/Purchase` | AdminOrStaff |
| GET | `/api/Purchase` | AdminOnly (paginated) |
| GET | `/api/Purchase/me` | Authenticated (staff-scoped) |
| GET | `/api/Purchase/{id}` | Authenticated |
| GET | `/api/Purchase/filtered` | Authenticated |
| PUT | `/api/Purchase/{id}` | AdminOrStaff |
| DELETE | `/api/Purchase/{id}` | AdminOnly (blocked if Delivered) |
| GET | `/api/Purchase/pdf` | AdminOrStaff |

**Purchase fields:** same shape as Order but with `supplierId`, `supplierName`, `purchaseDate`, `unitCost` on lines

**Status IDs (PurchaseStatus):** 1=Pending, 2=InProgressed, 3=Delivered, 4=Cancelled

**Business rules:** mirrors Orders but stock direction is In (increases stock, updates weighted avg cost)

### Payments ✅
Customer receipts and supplier payments with multi-order FIFO allocation.

**Endpoints:**
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/Payment` | AdminOrStaff |
| GET | `/api/Payment` | AdminOnly (paginated) |
| GET | `/api/Payment/me` | Authenticated |
| GET | `/api/Payment/{id}` | Authenticated |
| GET | `/api/Payment/by-client/{clientId}` | Authenticated |
| GET | `/api/Payment/filtered` | Authenticated |
| GET | `/api/Payment/unallocated/{clientId}` | Authenticated |
| PUT | `/api/Payment/{id}` | AdminOrStaff |
| POST | `/api/Payment/{id}/reverse` | AdminOnly |
| POST | `/api/Payment/{id}/reverse-and-correct` | AdminOnly |
| DELETE | `/api/Payment/{id}` | AdminOnly |
| GET | `/api/Payment/pdf` | AdminOrStaff |

**Payment fields:** `id`, `partyClientId`, `partyClientName`, `paymentDirectionId`, `transModeId`, `amount`, `paymentDate`, `notes`, `isReversed`, `allocations[]`, `recordedByName`

**Direction IDs:** 1=Received (customer pays us), 2=Paid (we pay supplier), 3=Adjustment

**Business rules:**
- FIFO auto-allocation when `allocations[]` is empty
- Manual allocation supported
- Reversal never deletes — creates a mirror payment row with audit trail
- Advance payments (unallocated credit) auto-settle when order/purchase is Delivered

### Other Completed APIs
- **`/api/Client`** — CRUD for customers and suppliers (`clientTypeId`: 1=Customer, 2=Supplier)
- **`/api/Product`** — CRUD for products with stock quantities
- **`/api/StockMovement`** — Stock movement history
- **`/api/Meta`** — Lookup data (statuses, payment types, categories, etc.)
- **`/api/Auth`** — Login, register, token refresh

### Reporting Views (MySQL)
- `v_monthly_profit_loss` — Sales, Purchases, Expenses by month (uses `trans_category_id`)
- `v_client_balance` — Per-client balance (reads payments table directly)
- `v_monthly_credit_debit` — Monthly cash in vs cash out

---

## 3. Frontend — Current State

**Location:** `frontend/`

**What exists:**
- Expo + React Native scaffold
- `orval.config.ts` — configured to auto-generate typed Axios clients from the backend Swagger spec (`http://localhost:5000/swagger/v1/swagger.json`), outputs to `src/api/` (one file per controller tag) and `src/api/model/` (TypeScript interfaces)
- Axios instance in `src/utils/api.js` — used as the orval mutator so interceptors apply to all generated clients
- Basic navigation (Stack) with 3 placeholder screens: Home, ItemDetails, AddItem (all placeholder — not real domain screens)
- Old Redux store + `itemsSlice` — **to be deleted** (replaced by Zustand)
- `storage.js` utility (AsyncStorage wrappers) — keep, useful for token persistence

**New frontend architecture (decided):**
- **Orval** — generates typed API hooks/functions from the backend Swagger spec. Run `yarn orval` whenever backend endpoints change. Output lands in `src/api/`
- **Zustand** — replaces Redux entirely. One store file per domain (e.g. `src/store/authStore.ts`, `src/store/ordersStore.ts`). No reducers, no dispatch — just `set()` and direct state reads
- **No more Redux** — delete `src/store/index.js`, `src/store/slices/`, and Redux dependencies from `package.json`

**What's missing (everything business-specific):**
- Authentication screen + JWT token storage + auth state (Zustand `authStore`)
- Real navigation structure (tabs, auth gate)
- Orders screens (list, detail, create, status update)
- Purchases screens (list, detail, create, status update)
- Payments screens (list, detail, create, reverse)
- Clients screen
- Products screen
- Dashboard / summary screen

---

## 4. Key Technical Conventions

### API
- Base URL: `http://localhost:5000/api` (update for production)
- All endpoints return `Response<T>` wrapper: `{ success: bool, message: string, data: T }`
- Paginated endpoints return `PagedList<T>`: `{ items: T[], totalCount, pageNumber, pageSize }`
- Auth: `Authorization: Bearer <token>` header required for protected routes

### Shared Lookup IDs (seeded, stable)
| Lookup | ID | Name |
|--------|----|------|
| ClientType | 1 | Customer |
| ClientType | 2 | Supplier |
| OrderStatus / PurchaseStatus | 1 | Pending |
| OrderStatus / PurchaseStatus | 2 | InProgressed |
| OrderStatus / PurchaseStatus | 3 | Delivered |
| OrderStatus / PurchaseStatus | 4 | Cancelled |
| PaymentType | 1 | Cash |
| PaymentType | 3 | Credit |
| PaymentDirection | 1 | Received |
| PaymentDirection | 2 | Paid |
| PaymentDirection | 3 | Adjustment |
| TransType | 1 | Debit |
| TransType | 2 | Credit |

### Frontend Patterns to Follow
- **Orval** generates typed functions (e.g. `getOrder()`, `postOrder()`) — import directly from `src/api/`
- **Zustand** stores hold UI state, auth token, and any cached/derived data — one file per domain in `src/store/`
- Zustand store pattern: `create<StoreType>((set, get) => ({ ... }))` — no reducers, no dispatch
- Persist auth token via `zustand/middleware` `persist` + AsyncStorage
- Loading / error state lives inside each Zustand store alongside the data
- Call orval-generated functions inside Zustand actions, not directly in components
- `navigation.navigate()` for screen transitions
- `Alert.alert()` for confirmations and errors
- Decimal quantities and prices (`qty`, `unitPrice`, `unitCost` are all `decimal`)

---

## 5. Frontend Roadmap

Build in this order — each phase is a self-contained vertical slice.

### Phase 1 — Authentication (FIRST — gates everything else)
**Screens:** LoginScreen
**Work:**
- Install Zustand: `yarn add zustand`
- Install Orval: `yarn add -D orval` then run `yarn orval` to generate `src/api/`
- Remove Redux: uninstall `@reduxjs/toolkit`, `react-redux`, delete `src/store/slices/`, `src/store/index.js`
- `src/store/authStore.ts` — holds `token`, `user`, `role`, `isAuthenticated`; actions: `login()`, `logout()`
- Token persisted via Zustand `persist` middleware + AsyncStorage
- Axios interceptor in `src/utils/api.js` reads token from authStore and injects `Authorization` header
- Navigation splits into `AuthStack` (pre-login) and `AppStack` (post-login)
- Auto-redirect if token exists on app launch
- **API:** orval-generated `postAuthLogin()` from `src/api/auth.ts`

---

### Phase 2 — App Shell & Navigation
**Work:**
- Bottom tab navigator: **Orders | Purchases | Payments | More**
- Stack navigators nested inside each tab
- Header with logout button
- Role-based visibility (Admins see all tabs; Staff see their scoped views)

---

### Phase 3 — Orders Module
**Screens:** OrdersListScreen, OrderDetailScreen, CreateOrderScreen
**Work:**
- `src/store/ordersStore.ts` — holds `orders[]`, `selectedOrder`, `loading`, `error`; actions call orval-generated functions
- OrdersListScreen: FlatList of orders, filter by status, FAB to create
- OrderDetailScreen: shows header info + lines + status badge + outstanding amount
- Status update button (Pending → Delivered / Cancelled) with confirmation
- CreateOrderScreen: client picker, date, payment type, line items (product + qty + price), notes
- **API:** orval-generated functions from `src/api/order.ts`

---

### Phase 4 — Purchases Module
**Screens:** PurchasesListScreen, PurchaseDetailScreen, CreatePurchaseScreen
**Work:** mirrors Orders exactly but for suppliers and cost prices
- `src/store/purchasesStore.ts`
- Same screen structure as Orders
- **API:** orval-generated functions from `src/api/purchase.ts`

---

### Phase 5 — Payments Module
**Screens:** PaymentsListScreen, PaymentDetailScreen, CreatePaymentScreen
**Work:**
- `src/store/paymentsStore.ts`
- PaymentsListScreen: list with direction badge (Received / Paid), filter by client
- PaymentDetailScreen: amount, direction, mode, allocations breakdown, reversed indicator
- CreatePaymentScreen: client picker, direction, mode, amount, date, optional allocations
- Unallocated credit display per client
- **API:** orval-generated functions from `src/api/payment.ts`

---

### Phase 6 — Clients & Products (Reference Data)
**Screens:** ClientsListScreen, ProductsListScreen (read-only for Staff; CRUD for Admin)
**Work:** simple list + detail screens, search/filter
- **APIs:** `GET /api/Client`, `GET /api/Product`

---

### Phase 7 — Dashboard
**Screens:** DashboardScreen (home tab)
**Work:**
- Summary cards: total outstanding orders, purchases payable, recent payments
- Monthly P&L snapshot
- Quick-action buttons
- **APIs:** `GET /api/Meta/all`, reporting endpoints

---

### Phase 8 — Polish & Offline
- Pull-to-refresh on all lists
- Optimistic UI updates
- Error boundary components
- Empty state illustrations
- Offline queue for creates (sync when back online — `todo/10-sync.md`)

---

## 6. Files to Reference When Coding

| File | Purpose |
|------|---------|
| `frontend/src/utils/api.js` | Axios instance — add auth interceptor here (reads token from authStore) |
| `frontend/orval.config.ts` | Orval config — run `yarn orval` to regenerate `src/api/` after backend changes |
| `frontend/src/api/` | Auto-generated typed API functions (do not edit manually) |
| `frontend/src/store/authStore.ts` | Zustand auth store (to be created in Phase 1) |
| `frontend/src/navigation/AppNavigator.js` | Navigation — restructure in Phase 2 |
| `frontend/src/utils/storage.js` | AsyncStorage helpers (used by Zustand persist middleware) |
| `planning/backend/orders-sprint/` | Orders domain rules |
| `planning/backend/purchases-sprint/` | Purchases domain rules |
| `planning/backend/payments-sprint/` | Payments domain rules |
