# Frontend — All Remaining Work

**Status:** 🔴 Not Started (scaffold only)

## Current State (from full scan)

- `App.js` → `AppNavigator` → Stack of 3 screens: `HomeScreen`, `AddItemScreen`, `ItemDetailsScreen` (all generic "items", not domain)
- Redux store: only `itemsSlice` (generic items CRUD with async thunks) — no auth, no domain slices
- `src/utils/api.js` — Axios client pointing to `http://localhost:5000/api`; auth interceptor is commented out; only exports generic `fetchItems`, `createItem`, `updateItem`, `deleteItem`
- `src/components/`: only `Button.js` and `Card.js`
- No login screen, no token storage, no role-based navigation

---

## 1. Auth & Token Management

- [ ] Install `expo-secure-store` for secure token storage (do NOT use plain AsyncStorage for tokens)
- [ ] Build `LoginScreen`:
  - Username + Password form
  - On submit: call `POST /api/Auth/login`
  - On success: store `accessToken` and `refreshToken` in `SecureStore`
  - Store `userId`, `roleId`, `userName` in Redux `authSlice`
- [ ] Add auth token to `api.js` Axios request interceptor (uncomment and implement)
- [ ] Add 401 response interceptor: call `POST /api/Auth/refresh`, retry original request; on refresh failure → logout
- [ ] Build `ChangePasswordScreen` → call `POST /api/Auth/change-password`
- [ ] Build `ForgotPasswordScreen` → call `POST /api/Auth/forgot-password`
- [ ] Implement logout: clear `SecureStore` tokens + call `POST /api/Auth/logout` + call `DELETE /api/Device/unregister`

## 2. Redux Store (`src/store/`)

- [ ] Create `authSlice.js` — state: `{ userId, roleId, userName, isAuthenticated, loading, error }`
  - Thunks: `loginAsync`, `logoutAsync`, `refreshTokenAsync`
- [ ] Create `clientsSlice.js` — state: `{ clients, currentClient, loading, error }`
  - Thunks: `fetchClientsAsync`, `createClientAsync`, `updateClientAsync`, `deleteClientAsync`
- [ ] Create `productsSlice.js` — state: `{ products, currentProduct, loading, error }`
  - Thunks: `fetchProductsAsync`, `createProductAsync`, `updateProductAsync`, `deleteProductAsync`
- [ ] Create `ordersSlice.js` — state: `{ orders, currentOrder, loading, error }`
  - Thunks: `fetchOrdersAsync`, `createOrderAsync`, `updateOrderAsync`, `deleteOrderAsync`
- [ ] Create `paymentsSlice.js` — state: `{ payments, loading, error }`
  - Thunks: `fetchPaymentsAsync`, `createPaymentAsync`
- [ ] Create `syncSlice.js` — state: `{ pendingChanges[], lastSyncedAt, syncStatus, syncErrors[] }`
  - Thunks: `pushSyncAsync`, `pullSyncAsync`
- [ ] Wire all slices into `src/store/index.js` alongside existing `itemsSlice`

## 3. API Utility (`src/utils/api.js`)

- [ ] Add domain API functions alongside existing item functions:
  - Auth: `login`, `logout`, `refreshToken`, `changePassword`, `forgotPassword`
  - Clients: `fetchClients`, `fetchClientById`, `createClient`, `updateClient`, `deleteClient`
  - Products: `fetchProducts`, `fetchProductById`, `createProduct`, `updateProduct`, `deleteProduct`
  - Orders: `fetchOrders`, `fetchOrderById`, `createOrder`, `updateOrder`, `deleteOrder`
  - Payments: `fetchPayments`, `createPayment`
  - Lookups: `fetchClientTypes`, `fetchOrderStatuses`, `fetchPaymentTypes`, `fetchTransModes`
  - Sync: `pushSync`, `pullSync`, `pingSync`
  - Device: `registerDevice`, `unregisterDevice`

## 4. Navigation (`src/navigation/AppNavigator.js`)

- [ ] Add Auth stack (shown when not logged in): `LoginScreen`, `ForgotPasswordScreen`
- [ ] Add Main stack/tab navigator (shown when logged in):
  - Dashboard/Home
  - Clients tab → `ClientListScreen` → `ClientDetailScreen` / `AddClientScreen`
  - Products tab → `ProductListScreen` → `ProductDetailScreen`
  - Orders tab → `OrderListScreen` → `CreateOrderScreen` / `OrderDetailScreen`
  - Payments tab → `PaymentListScreen` → `RecordPaymentScreen`
  - Reports tab (Admin only) → `ReportScreen`
  - Settings → `ChangePasswordScreen`
- [ ] Add role-based guard: hide Reports tab if `roleId !== 1` (Admin)

## 5. Screens

### Clients (Epic 3)
- [ ] `ClientListScreen` — paginated list from `GET /api/Client/me`; search/filter bar
- [ ] `ClientDetailScreen` — view client info + balance (if available); edit button
- [ ] `AddClientScreen` — form with ClientType picker (from `GET /api/ClientType`)

### Products (Epic 4)
- [ ] `ProductListScreen` — list with SKU, quantity, price
- [ ] `ProductDetailScreen` — view product details including AverageCost, stock level, reorder level
- [ ] `AddProductScreen` — form to create new product

### Orders (Epic 5)
- [ ] `OrderListScreen` — list with status badge, client name, date
- [ ] `CreateOrderScreen` — pick client, pick payment type, add order lines (product picker + qty + price)
- [ ] `OrderDetailScreen` — view order with lines; status update; generate invoice button

### Payments (Epic 6)
- [ ] `PaymentListScreen` — list by client with direction indicator
- [ ] `RecordPaymentScreen` — form: client picker, amount, direction, TransMode, date

### Reports (Epic 8 — Admin only)
- [ ] `ReportScreen` — monthly P&L from `GET /api/Report/profit-loss`
- [ ] `ClientBalanceScreen` — all client balances from `GET /api/Report/client-balance`

## 6. Offline-First / SQLite (Epic 7)

- [ ] Install `expo-sqlite`
- [ ] Create local DB schema for: Clients, Orders, OrderLines, Payments, StockMovements
- [ ] Modify all create/update operations: write to local SQLite first, then queue for sync
- [ ] Build sync queue in `syncSlice`: array of `{ entity, operation, data, localId, status }`
- [ ] On connectivity restore: dispatch `pushSyncAsync` (sends pending queue to `POST /api/Sync/push`)
- [ ] On app open / pull-to-refresh: dispatch `pullSyncAsync` (fetches changes since `lastSyncedAt`)
- [ ] Show sync status indicator in header or footer: "N pending", "Synced X min ago", "Sync failed"

## 7. Push Notifications (Epic 10)

- [ ] Install `expo-notifications`
- [ ] Request push permission on first app launch after login
- [ ] Get Expo push token and call `POST /api/Device/register`
- [ ] Handle incoming notifications (foreground: show in-app banner; background: standard OS notification)
- [ ] On logout: call `DELETE /api/Device/unregister`

## Notes

- Token storage: use `expo-secure-store` — never `AsyncStorage` for JWT tokens (architecture decision)
- All list screens should render from local SQLite when offline; show stale-data indicator
- Backend is authoritative for validation — show backend error messages from `response.errors[]` in forms
- `roleId` from JWT determines screen access — check in navigation guards AND individual screens
