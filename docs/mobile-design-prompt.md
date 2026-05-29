# HamzaTex Mobile App — Design Prompt for Claude

Paste the section below into Claude (with the `frontend-design` skill active) to generate the full React Native / Expo screen set for the HamzaTex ERP mobile app.

---

## Prompt

Design and implement a complete React Native (Expo) mobile application for **HamzaTex** — a textile/trading ERP used by field staff, accountants, managers, and admins in Pakistan. The app is offline-first: staff record data in the field without connectivity and sync when back online.

---

## Aesthetic Direction

**Modern Professional Light** — clean, airy, and trustworthy. Think a premium fintech dashboard crossed with a well-designed logistics app.

### Color Palette

| Role | Value |
| --- | --- |
| Background | `#F7F9FC` (off-white, easy on eyes) |
| Card surface | `#FFFFFF` |
| Primary | `#1A56DB` (strong blue — professional) |
| Primary light | `#EBF0FF` (tinted blue for badge backgrounds) |
| Accent / CTA | `#0E9F6E` (emerald green — confirm, success, profit) |
| Danger | `#E02424` (loss, debit, cancel) |
| Warning | `#FF8800` (pending, low stock) |
| Text primary | `#111827` |
| Text secondary | `#6B7280` |
| Divider | `#E5E7EB` |
| Shadow | `rgba(0,0,0,0.06)` |

### Typography — Quicksand throughout

- **Display / Hero numbers**: Quicksand Bold 32–40px
- **Screen titles**: Quicksand SemiBold 22px
- **Section headers**: Quicksand SemiBold 16px
- **Body / labels**: Quicksand Regular 14px
- **Amounts / SKUs / codes**: Quicksand Bold 15px, letter-spacing 0.5
- Load via `@expo-google-fonts/quicksand`

### Spatial & Component Style

- Card border-radius: 16px with `elevation: 2` shadow
- Button border-radius: 12px
- Input border-radius: 10px, border `#D1D5DB`, focus border `#1A56DB`
- Bottom tab bar: white with top border, active icon filled blue, inactive grey
- FAB: blue circle, white `+` icon, bottom-right, `elevation: 6`
- List rows: white card style, 16px padding, chevron right icon
- Generous whitespace — 24px horizontal screen padding

### Motion

- Screen transitions: 250ms slide-right (stack), fade (tab switch)
- Numbers animate from 0 → value on screen entry (600ms ease-out)
- Skeleton shimmer loaders (grey animated gradient) on all list/card loading states
- Pull-to-refresh with Lottie spinner or native RefreshControl in blue

### Charts (react-native-gifted-charts or Victory Native)

- Bar charts: multi-color bars with rounded tops, gradient fills, animated on mount
- Line charts: smooth curves, filled area below line, gradient from primary to transparent
- Pie/donut charts: vibrant segments — use `#1A56DB`, `#0E9F6E`, `#FF8800`, `#A855F7`, `#E02424`
- All charts have visible axis labels, legend, and tap-to-tooltip interaction
- Charts scroll horizontally when data exceeds screen width

### Status Badges

| Status | Background | Text |
| --- | --- | --- |
| Pending | `#FFF3E0` | `#FF8800` |
| InProgressed | `#EBF0FF` | `#1A56DB` |
| Delivered | `#ECFDF5` | `#0E9F6E` |
| Cancelled | `#FEE2E2` | `#E02424` |
| Draft | `#F3F4F6` | `#6B7280` |
| Issued | `#F5F3FF` | `#7C3AED` |
| Paid | `#ECFDF5` | `#0E9F6E` |

---

## Tech Stack

- React Native + Expo managed workflow
- React Navigation 6 (native stack + bottom tabs)
- **Zustand** for all client state (replaces Redux — one store file per domain, no boilerplate)
- **Orval** for API layer — generates typed hooks + Axios instances from `GET /api/App/spec` (OpenAPI spec); run `yarn orval` to regenerate after backend changes
- `expo-secure-store` for token storage (never AsyncStorage for JWT)
- `expo-local-authentication` for biometric (Face ID / fingerprint) login
- `expo-sqlite` for offline local database
- `expo-notifications` for push notifications via **Firebase Cloud Messaging (FCM)** — hybrid Expo + bare workflow (EAS Build with native Firebase plugins)
- `expo-file-system` + `react-native-pdf` (or `expo-sharing`) for PDF viewing
- `@expo-google-fonts/quicksand` for typography
- `react-native-gifted-charts` for all charts
- All API responses: `{ success, message, data, errors[] }`

### Orval Setup

Orval config (`orval.config.ts` in project root):

```ts
export default {
  hamzatex: {
    input: 'http://localhost:5000/api/App/spec',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      client: 'axios',
      override: {
        mutator: { path: 'src/api/axiosInstance.ts', name: 'axiosInstance' },
      },
    },
  },
}
```

`src/api/axiosInstance.ts` — single Axios instance wired to SecureStore token + 401 refresh interceptor. All Orval-generated hooks import this instance automatically. Run `yarn orval` after any backend endpoint change.

---

## Auth Token Lifecycle

### Token Storage (SecureStore keys)

| Key | Value | Set When | Cleared When |
| --- | --- | --- | --- |
| `access_token` | JWT access token | Login, biometric login, successful refresh | Logout, refresh failure |
| `refresh_token` | Refresh token string | Login, biometric login, successful refresh | Logout, refresh failure |
| `biometric_token` | Long-lived biometric refresh token | Biometric setup | Biometric disable (NOT cleared on logout) |
| `user_data` | JSON `{ userId, roleId, userName }` | Login, biometric login | Logout |
| `push_token` | FCM device registration token | Push permission granted | Logout (unregistered from server) |

### Axios Instance — `src/api/axiosInstance.ts`

```ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../stores/authStore';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// REQUEST interceptor — attach access token to every call
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor — handle 401 with silent refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401, and only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/Auth/refresh`, {
          refreshToken,
        });

        if (!data.success) throw new Error(data.message);

        // Store new tokens
        await SecureStore.setItemAsync('access_token', data.data.accessToken);
        await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);

        // Retry all queued requests
        processQueue(null, data.data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        processQueue(refreshError, null);
        await forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const forceLogout = async () => {
  // Clear tokens
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('user_data');
  // Note: do NOT delete biometric_token here

  // Reset auth store
  useAuthStore.getState().logout();

  // Navigation will auto-redirect to LoginScreen since isAuthenticated = false
};

export default api;
```

### Token Flow Diagrams

**Login (password):**
```
POST /api/Auth/login  → { accessToken, refreshToken, userId, roleId, userName }
  → SecureStore: access_token, refresh_token, user_data
  → useAuthStore: { userId, roleId, userName, isAuthenticated: true }
  → Auto-sync (drop → full-pull → rebuild)
  → Navigate to Dashboard
```

**Login (biometric):**
```
Device biometric prompt (local) → on success:
POST /api/Auth/biometric/login  { biometricToken }
  → { accessToken, refreshToken, userId, roleId, userName }
  → SecureStore: access_token, refresh_token, user_data
  → useAuthStore: { userId, roleId, userName, isAuthenticated: true }
  → Auto-sync (drop → full-pull → rebuild)
  → Navigate to Dashboard
```

**Silent refresh (on 401):**
```
Any API call returns 401
  → Interceptor catches it
  → POST /api/Auth/refresh { refreshToken }
  → Store new tokens in SecureStore
  → Retry original request with new access token
  → If refresh also fails → forceLogout() → LoginScreen
```

**Logout:**
```
1. Check pending changes → force sync if any
2. POST /api/Auth/logout (invalidates current refresh token on server)
3. DELETE /api/Device/unregister (clears push token on server)
4. Drop all local SQLite tables
5. SecureStore: delete access_token, refresh_token, user_data, push_token
6. SecureStore: KEEP biometric_token (user may want biometric next time)
7. useAuthStore: { isAuthenticated: false }
8. Navigate to LoginScreen
```

---

## Device Management

### When Device Registers

| Event | Action |
| --- | --- |
| First login after push permission granted | Get FCM device token via `messaging().getToken()` → `POST /api/Device/register { pushToken, deviceType, appVersion }` |
| FCM token rotation | `messaging().onTokenRefresh()` fires → re-register with new token |
| App update | Check if stored token matches current → re-register if changed |
| Biometric login (returning user) | Device already registered — no action needed |

### When Device Unregisters

| Event | Action |
| --- | --- |
| User logout | `DELETE /api/Device/unregister` with this device's pushToken → server marks `IsActive = false` |
| User disables push in Settings | Same as logout — unregister this device |
| Push permission revoked by OS | Detected on next app open → unregister |

### Device Store — `src/stores/deviceStore.js`

Uses `@react-native-firebase/messaging` for FCM device tokens (not Expo Push tokens).

```ts
import * as SecureStore from 'expo-secure-store';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import api from '../api/axiosInstance';
import Constants from 'expo-constants';

export const useDeviceStore = create((set, get) => ({
  pushToken: null,
  notificationsEnabled: false,

  // Called after first successful login (from Push Notification Registration modal)
  registerForPush: async () => {
    if (Platform.OS === 'web') return;

    try {
      // Android 13+ requires runtime permission
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          set({ notificationsEnabled: false });
          return;
        }
      }

      // iOS permission request
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          set({ notificationsEnabled: false });
          return;
        }
      }

      // Get FCM device registration token
      const pushToken = await messaging().getToken();
      await SecureStore.setItemAsync('push_token', pushToken);

      // Register on server — multi-device support
      await api.post('/Device/register', {
        pushToken,
        deviceType: Platform.OS, // "ios" or "android"
        appVersion: Constants.expoConfig?.version,
      });

      // Listen for token refresh (FCM rotates tokens)
      messaging().onTokenRefresh(async (newToken) => {
        await SecureStore.setItemAsync('push_token', newToken);
        await api.post('/Device/register', {
          pushToken: newToken,
          deviceType: Platform.OS,
          appVersion: Constants.expoConfig?.version,
        });
        set({ pushToken: newToken });
      });

      set({ pushToken, notificationsEnabled: true });
    } catch (e) {
      console.error('Push registration failed:', e);
    }
  },

  // Called on logout — unregisters THIS device only (user may have other devices)
  unregisterFromPush: async () => {
    try {
      const pushToken = await SecureStore.getItemAsync('push_token');
      if (pushToken) {
        await api.delete('/Device/unregister', { data: { pushToken } });
      }
    } catch (e) {
      // Server-side cleanup — don't block logout
    } finally {
      await SecureStore.deleteItemAsync('push_token');
      set({ pushToken: null, notificationsEnabled: false });
    }
  },

  // Called on "logout all" — unregisters ALL devices
  unregisterAllDevices: async () => {
    try {
      await api.delete('/Device/unregister-all');
    } catch (e) {
      // Don't block logout
    } finally {
      await SecureStore.deleteItemAsync('push_token');
      set({ pushToken: null, notificationsEnabled: false });
    }
  },

  // Check permission status on app open
  checkPermissionStatus: async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().hasPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        const stored = await SecureStore.getItemAsync('push_token');
        set({ notificationsEnabled: enabled && !!stored });
      } else {
        const stored = await SecureStore.getItemAsync('push_token');
        set({ notificationsEnabled: !!stored });
      }
    } catch (e) {
      set({ notificationsEnabled: false });
    }
  },
}));
```

### Push Notification Handling

#### Notification Types (14 types sent by backend)

| Type | Deep Link Screen |
| --- | --- |
| `sync_complete` | SyncStatusScreen |
| `sync_partial` | SyncStatusScreen |
| `sync_failed` | SyncStatusScreen |
| `order_created` | OrderDetailScreen |
| `order_delivered` | OrderDetailScreen |
| `order_cancelled` | OrderDetailScreen |
| `purchase_delivered` | PurchaseDetailScreen |
| `payment_received` | PaymentListScreen (filtered by client) |
| `payment_paid` | PaymentListScreen (filtered by client) |
| `payment_reversed` | PaymentListScreen |
| `invoice_issued` | InvoiceDetailScreen |
| `invoice_overdue` | InvoiceDetailScreen |
| `low_stock` | ProductDetailScreen |
| `expense_approved` | ExpenseListScreen |

#### Notification Setup — `src/services/notifications.ts`

Uses `@react-native-firebase/messaging` for FCM and `expo-notifications` for local display.

```ts
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { navigationRef } from '../navigation/RootNavigation';
import { useNotificationStore } from '../stores/notificationStore';

// 1. Configure local notification display (for foreground notifications)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. Deep link map — notification type → screen + params
const DEEP_LINK_MAP: Record<string, (data: any) => [string, any]> = {
  order_created:      (d) => ['OrderDetail',     { orderId: d.entityId }],
  order_delivered:    (d) => ['OrderDetail',     { orderId: d.entityId }],
  order_cancelled:    (d) => ['OrderDetail',     { orderId: d.entityId }],
  purchase_delivered: (d) => ['PurchaseDetail',  { purchaseId: d.entityId }],
  payment_received:   (d) => ['PaymentList',     { clientId: d.clientId }],
  payment_paid:       (d) => ['PaymentList',     { clientId: d.clientId }],
  payment_reversed:   (d) => ['PaymentList',     {}],
  invoice_issued:     (d) => ['InvoiceDetail',   { invoiceId: d.entityId }],
  invoice_overdue:    (d) => ['InvoiceDetail',   { invoiceId: d.entityId }],
  low_stock:          (d) => ['ProductDetail',   { productId: d.entityId }],
  expense_approved:   (d) => ['ExpenseList',     {}],
  sync_complete:      (d) => ['SyncStatus',      {}],
  sync_partial:       (d) => ['SyncStatus',      {}],
  sync_failed:        (d) => ['SyncStatus',      {}],
};

// 3. Process a notification data payload (used by all 3 states)
const processNotification = (data: any) => {
  // Store in notification center
  useNotificationStore.getState().addNotification({
    type: data.type,
    title: data.title,
    body: data.body,
    entityId: data.entityId,
    timestamp: data.timestamp || new Date().toISOString(),
  });

  // Show in-app banner (for foreground)
  useNotificationStore.getState().showBanner({
    title: data.title,
    body: data.body,
    data,
  });
};

// 4. Handle notification tap → deep link
const handleNotificationTap = (data: any) => {
  const type = data?.type as string;
  const mapper = DEEP_LINK_MAP[type];
  if (mapper && navigationRef.isReady()) {
    const [screen, params] = mapper(data);
    navigationRef.navigate(screen, params);
  }
};
```

#### `useNotificationListeners` hook — called once in `App.js`

Handles all 3 notification states: **foreground**, **background**, and **quit** (app was killed).

```ts
import { useEffect, useRef } from 'react';
import messaging from '@react-native-firebase/messaging';
import { processNotification, handleNotificationTap } from '../services/notifications';

export function useNotificationListeners() {
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    // FOREGROUND — app is visible, user is using it
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      const data = remoteMessage.data;
      if (data) {
        processNotification(data);
      }
    });

    // BACKGROUND — app is in background, not killed
    // This handler runs as a headless task — MUST be registered outside useEffect
    // (registered at module level, see below)

    // QUIT — app was killed, user tapped notification to open it
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage?.data) {
        handleNotificationTap(remoteMessage.data);
        processNotification(remoteMessage.data);
      }
    });

    // BACKGROUND tap — app was in background, notification tap brings it to foreground
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage.data) {
          handleNotificationTap(remoteMessage.data);
          processNotification(remoteMessage.data);
        }
      }
    );

    return () => {
      unsubscribeForeground();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeRef.current?.();
    };
  }, []);
}
```

#### Background notification handler — `index.js` (MUST be registered at app entry, outside React)

```js
// index.js — top-level background handler for Firebase
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';

// Register background message handler BEFORE app renders
// This runs as a headless JS task when app is in background or killed
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // Process silently — write to SQLite if needed
  // OS notification is shown automatically by FCM for data+notification messages
  // For data-only messages, we must show a local notification manually:
  console.log('Background notification received:', remoteMessage.messageId);
});

AppRegistry.registerComponent('main', () => App);
```

#### `NotificationStore` — `src/stores/notificationStore.js`

```ts
export const useNotificationStore = create((set) => ({
  // In-app banner state
  banner: null, // { title, body, data } | null
  showBanner: (notification) => set({ banner: notification }),
  hideBanner: () => set({ banner: null }),

  // Notification history (stored locally in SQLite, not synced)
  notifications: [],       // last 50 notifications for notification center
  unreadCount: 0,
  markAllRead: () => set({ unreadCount: 0 }),
  addNotification: (n) => set((state) => ({
    notifications: [n, ...state.notifications].slice(0, 50),
    unreadCount: state.unreadCount + 1,
  })),
}));
```

---

## Role System

- `roleId = 1` → **Admin**: all screens including Reports and Users management
- `roleId = 2` → **Staff**: own clients/orders/payments only; no Reports tab; no Users screen

---

## Navigation Structure

### Unauthenticated Stack

1. `LoginScreen` — shown when no valid token exists
2. `BiometricLoginScreen` — shown when `biometric_token` exists in SecureStore (skip password)
3. `ForgotPasswordScreen`

### Authenticated — Bottom Tab Navigator

| Tab | Icon | Stack Root |
| --- | --- | --- |
| Home | house | `DashboardScreen` |
| Clients | users | `ClientListScreen` |
| Orders | clipboard-list | `OrderListScreen` |
| Payments | credit-card | `PaymentListScreen` |
| More | grid-2x2 | `MoreScreen` |

### More Screen navigation grid

- Notifications (badge with unread count)
- Products
- Purchases
- Invoices
- Expenses
- Stock Movements
- Transactions
- Reports *(Admin only)*
- Users *(Admin only)*
- Sync Status
- Settings

---

## Screens — Full Specification

### Screen 1: LoginScreen

- Top 40% of screen: blue gradient (`#1A56DB` → `#0E4DAB`) with white HamzaTex wordmark and tagline "Your business, always in hand"
- Bottom 60%: white rounded-top card with login form
- Username + Password fields (show/hide toggle)
- "Sign In" primary button full-width
- "Forgot password?" text link
- If `biometric_token` found in SecureStore → show "Use Face ID / Fingerprint" button above Sign In
- Backend: `POST /api/Auth/login` → SecureStore `access_token` + `refresh_token` → `useAuthStore.setState({ userId, roleId, userName, isAuthenticated: true })`
- On successful login → auto-trigger full sync: drop all local SQLite tables → call `POST /api/Sync/full-pull` → rebuild local DB with fresh server data → then navigate to Dashboard
- Show "Syncing your data…" loading screen with progress spinner between login and Dashboard
- Inline error banner (red bg) shows `response.message` on failure

### Screen 1b: BiometricLoginScreen

- Full-screen centered layout on `#F7F9FC` background
- HamzaTex logo at top
- Large animated fingerprint / Face ID icon (blue, pulse animation)
- "Welcome back, [userName]" heading — name read from SecureStore
- "Authenticating…" subtitle shown during biometric prompt
- On mount: auto-trigger `expo-local-authentication.authenticateAsync()` immediately
- On biometric success: call `POST /api/Auth/biometric/login` with stored `biometric_token` → store new tokens → auto-trigger full sync (drop tables → `POST /api/Sync/full-pull` → rebuild) → navigate to Dashboard
- On biometric failure / cancel: show "Use Password Instead" blue text link → navigate to LoginScreen
- On biometric token expired (401): show "Session expired — please sign in with your password" + "Sign In" button
- Backend: `POST /api/Auth/biometric/login`

### Screen 2: ForgotPasswordScreen

- Back arrow + title "Reset Password"
- Illustrated icon (envelope with key)
- Email input field
- "Send Reset Link" blue button
- Success state: green checkmark + "Check your email" message
- Backend: `POST /api/Auth/forgot-password`

### Screen 3: DashboardScreen

- Greeting header: "Good morning, [userName]" + current date (Quicksand SemiBold)
- Horizontal scroll row of 4 stat cards (each 160px wide, rounded, shadow):
  - Today's Orders (blue) — count + total amount below
  - Total Outstanding (orange) — amount (what clients owe)
  - Pending Payments (purple) — count
  - Low Stock Items (red) — count
- "Monthly Overview" section: colorful grouped bar chart (Sales=blue, Purchases=orange, Expenses=red, last 6 months), animated on mount, tap bar → tooltip with exact month figures
- "Recent Orders" section: last 5 orders as white card rows with client name, amount, status badge
- SyncStatusBar pinned above bottom tabs
- Backend: `GET /api/Dashboard/summary` (stat cards + recent orders), `GET /api/Dashboard/monthly-overview?months=6` (chart data)
- State: `useDashboardStore` — `{ summary, monthlyOverview, loading, error }`
- Role-scoped automatically by backend (Admin sees all, Staff sees own)

### Screen 4: ClientListScreen

- Search bar with filter icon
- Segmented control: All / Customers / Suppliers
- Paginated white card list rows:
  - Left: client name (SemiBold), phone below
  - Center: type pill badge
  - Right: balance amount (green = credit to you, red = owes you) + chevron
- FAB bottom-right → ClientFormScreen
- Pull-to-refresh
- Swipe left on row: red Delete button; swipe right: blue Edit button
- Backend: `GET /api/Client/me` (staff), `GET /api/Client` (admin)

### Screen 5: ClientDetailScreen

- Header card (blue gradient): client name, type badge, active chip
- Balance hero card: large amount, "Owes You" / "You Owe" / "Settled" label, colored accordingly
- Info rows: phone, address, credit limit, opening balance, notes
- Tab bar (underline style): Orders | Payments | Invoices | Transactions
- Each tab renders a compact card list of linked records
- Top-right Edit icon → ClientFormScreen

### Screen 6: ClientFormScreen (Create and Edit)

- Section header: "Client Information"
- Name, Phone, Address, Notes fields
- ClientType picker row (Customer / Supplier chips)
- Credit Limit + Opening Balance numeric fields with "PKR" prefix label
- "Save Client" green button
- Inline validation errors highlighted red under each field
- Backend: `POST /api/Client` or `PUT /api/Client/{id}`

### Screen 7: ProductListScreen

- Search bar
- Filter row chips: All / Low Stock / Out of Stock
- Card list rows:
  - Left: product name (SemiBold), SKU in Quicksand Bold smaller + grey
  - Center: unit label
  - Right: stock quantity badge (red if below reorder level) + price
- FAB → ProductFormScreen
- Backend: `GET /api/Product`

### Screen 8: ProductDetailScreen

- Product name + SKU header
- 2×2 stats grid (each card with icon, value, label):
  - Current Stock (blue box icon)
  - Average Cost (orange coins icon)
  - Average Price (green tag icon)
  - Reorder Level (red alert icon)
- Colorful line chart: stock quantity over time (last 30 movements)
- "Recent Movements" list: colored In/Out/Adjustment rows with qty and date
- Edit button top-right

### Screen 9: ProductFormScreen

- Name, SKU, Unit, DefaultCost, DefaultPrice, ReorderLevel fields
- Initial Quantity field (helper text: "Set opening stock level")
- Save button
- Backend: `POST /api/Product` or `PUT /api/Product/{id}`

### Screen 10: OrderListScreen

- Filter chips row: All / Pending / InProgressed / Delivered / Cancelled
- Card list rows: order number (Quicksand Bold mono-style), client name, date, total amount right-aligned, status badge
- FAB → CreateOrderScreen
- Backend: `GET /api/Order/me`

### Screen 11: CreateOrderScreen

- Multi-step progress bar at top (3 steps)
- Step 1 — Details: Client picker (searchable modal), Payment Type picker chips, Notes
- Step 2 — Lines: "Add Product" button opens product search modal; each line shows product name, qty stepper, price input, line total; running total footer
- Step 3 — Review: full order summary card before submit
- "Place Order" green CTA on step 3
- Backend: `POST /api/Order`

### Screen 12: OrderDetailScreen

- Order number + date header, status badge
- Client row card (tappable → ClientDetailScreen)
- Lines table: product | qty | unit price | line total; styled alternating row bg
- Financial summary section: Subtotal, Amount Received (green), Outstanding (orange or zero)
- Action buttons (context-aware):
  - Draft/Pending: "Mark In Progress" (blue outline)
  - InProgress: "Mark Delivered" (green filled)
  - Any non-cancelled: "Cancel Order" (red text)
- "View Invoice" tappable chip if invoice exists; "Generate Invoice" button if not
- Backend: `PUT /api/Order/{id}`

### Screen 13: PurchaseListScreen

- Same layout pattern as OrderListScreen
- "Supplier" column label instead of "Client"
- Backend: `GET /api/Purchase/me`

### Screen 14: CreatePurchaseScreen

- Same multi-step flow as CreateOrderScreen
- Supplier picker (only Supplier-type clients)
- "Unit Cost" label instead of "Unit Price"
- Backend: `POST /api/Purchase`

### Screen 15: PurchaseDetailScreen

- Same layout as OrderDetailScreen
- "Amount Payable" instead of "Outstanding"
- Supplier card instead of Client card
- Backend: `GET /api/Purchase/{id}`, `PUT /api/Purchase/{id}`

### Screen 16: PaymentListScreen

- Filter: All / Received / Paid
- Card list rows:
  - Left: client name, date below
  - Center: mode badge (Cash / Bank / Credit)
  - Right: amount with arrow icon (↓ green = Received, ↑ orange = Paid)
- FAB → RecordPaymentScreen
- Backend: `GET /api/Payment/me`

### Screen 17: RecordPaymentScreen

- Client picker row (searchable modal, shows current balance inline in picker)
- Amount field (large numeric input, PKR prefix)
- Direction toggle: "Received" (green) / "Paid" (orange)
- TransMode chip picker: Cash / Bank / Credit
- Date row (defaults to today, tappable calendar picker)
- Optional "Allocate to Orders" expandable section: list of unallocated delivered orders as checkboxes with amount fields
- Notes field
- "Record Payment" CTA
- Backend: `POST /api/Payment`

### Screen 18: InvoiceListScreen

- Filter chips: All / Draft / Issued / Paid / Cancelled
- Card list rows: invoice number, client name, total, status badge, issue date
- Read-only list — no FAB (invoices generated from orders/purchases)
- Backend: `GET /api/Invoice`

### Screen 19: InvoiceDetailScreen

- Invoice number + status badge header
- Dates row: Issue Date | Due Date (colored red if overdue)
- Client card (tappable)
- Lines table: product | qty | unit price | line total
- Financial summary: Total, Paid (green), Outstanding (orange or zero)
- Status action buttons: "Issue Invoice" / "Mark Paid" / "Cancel" (context-aware)
- **"View PDF" button** → opens inline PDF viewer (react-native-pdf or WebView rendering the PDF from `GET /api/Invoice/{id}/pdf`)
- **"Share PDF" button** → calls expo-sharing to share the PDF file
- Backend: `GET /api/Invoice/{id}`, `PUT /api/Invoice/{id}`

### Screen 20: ExpenseListScreen

- Filter by type + date range (date range picker)
- Summary card at top: total expenses this month (with mini donut chart of types)
- Card list rows: category icon + badge, amount, mode, date, notes preview
- FAB → AddExpenseScreen
- Backend: `GET /api/Expense/me`

### Screen 21: AddExpenseScreen

- Amount field (large numeric, PKR prefix)
- ExpenseType picker chips: Office Expenses / Home Expenses
- TransMode chip picker
- Date row
- Notes field
- "Add Expense" CTA
- Backend: `POST /api/Expense`

### Screen 22: StockMovementListScreen

- Filter row: Product picker + Movement Type chips (In/Out/Adjustment) + date range
- Card list rows:
  - Left: colored circle icon (green In, red Out, blue Adjustment), product name
  - Right: qty with sign (+/-), date
- FAB → AddStockMovementScreen
- Backend: `GET /api/StockMovements`

### Screen 23: AddStockMovementScreen

- Product picker (shows current stock inline)
- Movement Source chip picker: Purchase / Sale / Manual
- Qty field
- Unit Cost / Unit Price field (label changes based on source)
- MovementType chip picker (only visible when Manual source selected)
- Date row
- "Record Movement" CTA
- Backend: `POST /api/StockMovements`

### Screen 24: TransactionListScreen

- Filter: Trans Type (Debit/Credit) + Trans Category + date range
- Card list rows:
  - Left: category icon, category label, client name below
  - Center: mode badge
  - Right: amount with type color (green Credit, red Debit), date
- Read-only (no FAB — system-generated ledger)
- Backend: `GET /api/Transaction/me`

### Screen 25: ReportsHubScreen (Admin only)

- Grid of 5 colorful report cards (2 column grid):
  - Monthly P&L (blue chart icon)
  - Client Balances (orange users icon)
  - Credit/Debit Summary (purple arrows icon)
  - Overall Summary (green grid icon)
  - Client Detail (teal person icon)
- Each card: title, description, "View Report" button + "PDF" icon button
- "Download PDF" on each calls the corresponding `/pdf` endpoint and opens PDF viewer

### Screen 26: ProfitLossScreen (Admin only)

- Month range picker at top
- Colorful grouped bar chart: Sales (blue) vs Purchases (orange) vs Expenses (red) per month, animated on mount, horizontal scroll for many months
- Summary stat cards row: Total Sales, Total Purchases, Total Expenses, Gross Profit, Net Profit (green if positive, red if negative)
- Monthly breakdown table below chart
- **"View PDF" button** → `GET /api/Report/profit-loss/pdf`
- Backend: `GET /api/Report/profit-loss`

### Screen 27: ClientBalanceScreen (Admin only)

- Segmented: Customers / Suppliers / All
- Summary at top: total outstanding (Customers owe you vs You owe Suppliers)
- Colorful horizontal bar chart: top 10 clients by balance
- Searchable paginated list: client name, balance (color-coded), balance direction label
- **"View PDF" button** → `GET /api/Report/client-balance/pdf`
- Backend: `GET /api/Report/client-balance`

### Screen 28: CreditDebitScreen (Admin only)

- Smooth line chart: Credit (green) vs Debit (red) per month, filled area, animated
- Monthly table: Month | Total Credit | Total Debit | Net Balance
- Color-coded rows (net positive = green bg tint, net negative = red tint)
- **"View PDF" button** → `GET /api/Report/credit-debit/pdf`
- Backend: `GET /api/Report/credit-debit`

### Screen 29: SummaryScreen (Admin only)

- Large stat cards with icons + trend arrows: Total Sales, Total Purchases, Total Expenses, Payments Received, Payments Paid
- Donut chart: expense breakdown by category with colored legend
- **"View PDF" button** → `GET /api/Report/summary/pdf`
- Backend: `GET /api/Report/summary`

### Screen 30: ClientDetailReportScreen (Admin only)

- Client picker at top (searchable modal)
- Balance hero card (same as ClientDetailScreen)
- Colorful area chart: balance trend over time
- Full ledger section: Orders, Purchases, Payments tabs
- **"View PDF" button** → `GET /api/Report/client-detail/{id}/pdf`
- Backend: `GET /api/Report/client-detail/{id}`

### Screen 31: UserListScreen (Admin only)

- Card list rows: avatar initials circle (colored by role), name + email, role badge, active/inactive chip
- FAB → AdminCreateUserScreen
- Backend: `GET /api/Users`

### Screen 32: AdminCreateUserScreen (Admin only)

- Full Name, Email, Username, Password fields
- Role picker chips: Admin (blue) / Staff (green)
- Helper text: "Account will be pre-confirmed — no email verification required"
- "Create Account" CTA
- Backend: `POST /api/Users`

### Screen 33: SyncStatusScreen

- Hero card: large sync status icon + "All data is synced" / "X changes pending sync"
- Last synced timestamp
- **Pending changes list**: each queued operation as a card row (entity name, operation type, timestamp)
- "Sync Now" blue button — on tap executes this exact flow:
  1. Phase 1 "Uploading changes…": call `POST /api/Sync/push` (sends all pending local changes to server)
  2. Phase 2 "Refreshing data…": drop all local SQLite tables → call `POST /api/Sync/full-pull` → recreate tables from server response
  3. Done: update `lastSyncedAt`, show green checkmark + "All data is synced"
- Per-item result after push: green checkmark (accepted), red X (rejected with error reason)
- Connectivity indicator: Online (green dot) / Offline (grey dot)
- Storage info row: "Local data: 2.4 MB" (shows current SQLite size)
- Backend: `GET /api/Sync/ping`, `POST /api/Sync/push`, `POST /api/Sync/full-pull`

### Screen 34: SettingsScreen

- Profile card at top: avatar initials circle (colored by role), name, email, role badge
- Section "Account":
  - Change Password row → ChangePasswordScreen
  - Resend Confirmation row
- Section "Security":
  - Biometric Login toggle (Face ID / Fingerprint) — reads current state from SecureStore (`biometric_token` present = enabled)
  - Toggle ON: call `expo-local-authentication.authenticateAsync()` to confirm identity → on success call `POST /api/Auth/biometric/setup` → store returned `biometricToken` in SecureStore under `biometric_token`
  - Toggle OFF: call `DELETE /api/Auth/biometric/disable` → clear `biometric_token` from SecureStore
  - Show biometric type label ("Face ID" on iOS, "Fingerprint" on Android) using `expo-local-authentication.supportedAuthenticationTypesAsync()`
  - If device has no biometric hardware: row is hidden
- Section "Sync": Last synced time, Sync Now button, Clear Local Data (destructive, confirmation dialog)
- Section "Notifications": push notification toggle (register/unregister)
- Section "About": App version, API status ping indicator
- "Sign Out" red row at bottom → **guarded logout flow**:
  1. Check `useSyncStore.pendingChanges` — if any pending changes exist:
     - Show blocking modal: "You have X unsynced changes. Sync now before signing out?"
     - "Sync & Sign Out" button → push pending changes → wait for success → proceed to logout
     - "Cancel" → return to settings
  2. If no pending changes (or after successful push):
     - Call `POST /api/Auth/logout` + `DELETE /api/Device/unregister`
     - Drop all local SQLite tables (clear all local data)
     - Clear SecureStore keys (keep `biometric_token` if enabled — user may want biometric next login)
     - Navigate to LoginScreen

### Screen 35: ChangePasswordScreen

- Current Password, New Password, Confirm New Password fields (all with show/hide toggle)
- Password strength indicator bar (red → orange → green)
- "Update Password" CTA
- Backend: `POST /api/Auth/change-password`

### Screen 36: Push Notification Registration Flow

- Shown after first login as a full-screen modal (not a separate route):
  - Illustrated graphic (bell with sparkles)
  - Title: "Stay in the loop"
  - Body: "Get notified when orders update, sync completes, or payments are recorded"
  - "Enable Notifications" blue button → `expo-notifications` permission request → on grant, call `POST /api/Device/register`
  - "Not Now" grey text link → dismisses and skips
- On logout: `DELETE /api/Device/unregister` for this device only

### Screen 37: NotificationCenterScreen

- Accessible from More screen grid and from bell icon in top-right of Dashboard header (shows unread count badge)
- Title: "Notifications" + "Mark all read" text button top-right
- List of notification cards sorted newest first (from `useNotificationStore.notifications`):
  - Left: colored type icon circle (order=blue clipboard, payment=green card, sync=purple refresh, low_stock=red alert, invoice=indigo doc)
  - Center: notification title (SemiBold) + body text (Regular, grey) + relative timestamp ("2 min ago", "Yesterday")
  - Unread indicator: small blue dot on the right edge
- Tap notification card → navigates via deep link map (same mapping as push notification taps)
- Swipe left → "Delete" action (removes from local store only)
- Empty state: bell illustration + "You're all caught up"
- Notifications are stored locally only (SQLite) — they are NOT synced to server
- Source: `useNotificationStore` — populated by:
  1. Push notifications received while app is in foreground
  2. Push notifications received in background (checked on app open via `getLastNotificationResponseAsync`)
  3. Notifications generated locally (e.g. low stock detected during sync)

---

## PDF Viewer Architecture

Every endpoint that returns a PDF (`GET /api/.../pdf`) must be handled as follows:

1. Axios downloads the PDF binary with `responseType: "blob"` (or `arraybuffer`)
2. Save to device temp directory with `expo-file-system` (`FileSystem.downloadAsync`)
3. Open in-app with `react-native-pdf` component inside a full-screen modal (white bg, close X top-right, share button top-right)
4. Fallback: if `react-native-pdf` unavailable, use `expo-sharing` to hand off to the OS PDF viewer
5. Loading state: blue circular progress indicator with "Preparing PDF..." label
6. Error state: red alert icon + "Could not load PDF — tap to retry"

---

## Global Components

### SyncStatusBar

Persistent slim bar (36px height) above the bottom tab navigator.

| State | Color | Text |
| --- | --- | --- |
| Synced | `#ECFDF5` + green text | "Synced 2m ago" |
| Pending | `#FFF3E0` + orange text | "3 changes pending — tap to sync" |
| Syncing | `#EBF0FF` + blue text + spinner | "Syncing…" |
| Failed | `#FEE2E2` + red text | "Sync failed — tap to retry" |
| Hidden | — | (hidden when synced and no pending) |

### OfflineBanner

Full-width amber strip below the header when `NetInfo.isConnected = false`: "You're offline. Showing cached data."

### AmountText

Quicksand Bold formatted amount with thousands separator (e.g. "1,450,000"). Accepts `type` prop: `credit` (green `#0E9F6E`), `debit` (red `#E02424`), `neutral` (grey `#6B7280`).

### StatusBadge

Pill badge component mapping status strings to the color scheme defined above.

### SearchableModal

Full-screen white modal with search input + FlatList. Used for Client picker, Product picker, Supplier picker. Renders a "balance" or "stock" sub-label under each item name.

### SkeletonLoader

Grey animated shimmer block replacing content during loading. Pre-built variants: `SkeletonRow`, `SkeletonCard`, `SkeletonChart`.

### PDFViewerModal

Full-screen modal wrapping `react-native-pdf`. Props: `uri`, `title`, `onClose`, `onShare`.

---

## Zustand Stores

One file per domain in `src/stores/`. Each store uses Zustand's `create` with no middleware boilerplate. API calls use Orval-generated hooks internally (via `useSWR`-style pattern) or call Orval-generated Axios functions directly inside actions.

```js
// src/stores/authStore.js
useAuthStore       // { userId, roleId, userName, isAuthenticated, biometricEnabled, login(), logout(), refreshToken() }

// src/stores/clientStore.js
useClientStore     // { clients[], currentClient, pagination, loading, error, fetchClients(), createClient(), updateClient(), deleteClient() }

// src/stores/productStore.js
useProductStore    // { products[], currentProduct, pagination, loading, error, fetchProducts(), createProduct(), updateProduct() }

// src/stores/orderStore.js
useOrderStore      // { orders[], currentOrder, pagination, loading, error, fetchOrders(), createOrder(), updateOrder() }

// src/stores/purchaseStore.js
usePurchaseStore   // { purchases[], currentPurchase, pagination, loading, error, fetchPurchases(), createPurchase(), updatePurchase() }

// src/stores/paymentStore.js
usePaymentStore    // { payments[], pagination, loading, error, fetchPayments(), createPayment() }

// src/stores/invoiceStore.js
useInvoiceStore    // { invoices[], currentInvoice, pagination, loading, error, fetchInvoices() }

// src/stores/expenseStore.js
useExpenseStore    // { expenses[], pagination, loading, error, fetchExpenses(), createExpense() }

// src/stores/transactionStore.js
useTransactionStore // { transactions[], pagination, loading, error, fetchTransactions() }

// src/stores/dashboardStore.js
useDashboardStore  // { summary, monthlyOverview, loading, error, fetchSummary(), fetchMonthlyOverview() }

// src/stores/reportStore.js
useReportStore     // { profitLoss, clientBalances, creditDebit, summary, loading, fetchProfitLoss(), fetchClientBalances(), fetchCreditDebit(), fetchSummary() }

// src/stores/syncStore.js
useSyncStore       // { pendingChanges[], lastSyncedAt, syncStatus, syncErrors[], pushSync(), pullSync(), ping() }

// src/stores/notificationStore.js
useNotificationStore // { notifications[], unreadCount, banner, showBanner(), hideBanner(), addNotification(), markAllRead() }

// src/stores/metaStore.js
useMetaStore       // { clientTypes[], orderStatuses[], purchaseStatuses[], paymentTypes[], transModes[], transCategories[], expenseTypes[], movementTypes[], movementSources[], userRoles[], invoiceStatuses[], loadAll() }
```

### Pattern for each store

```ts
import { create } from 'zustand';
import { clientApi } from '../api/generated'; // Orval-generated

export const useClientStore = create((set, get) => ({
  clients: [],
  currentClient: null,
  pagination: { page: 1, pageSize: 20, totalCount: 0 },
  loading: false,
  error: null,

  fetchClients: async (page = 1, pageSize = 20) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clientApi.getClients(page, pageSize);
      set({ clients: data.data.items, pagination: data.data.pagination, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // ... createClient, updateClient, deleteClient follow same pattern
}));
```

---

## Offline-First Architecture — Full Replace Sync

The app uses a **full replace** sync strategy to keep local storage minimal. No incremental delta — every sync drops and rebuilds local data from the server.

### Sync Flow (on "Sync Now" button)

```
1. PUSH  → POST /api/Sync/push   (upload pending local changes)
2. DROP  → Delete all local SQLite tables
3. PULL  → POST /api/Sync/full-pull (download full dataset from server)
4. BUILD → Recreate SQLite tables from pull response
5. DONE  → Update lastSyncedAt, clear pendingChanges[]
```

### Login Flow

```
1. User logs in (password or biometric) → tokens stored in SecureStore
2. Auto-sync: drop tables → POST /api/Sync/full-pull → rebuild local DB
3. Show "Syncing your data…" loading screen during step 2
4. Navigate to Dashboard (all screens now render from local SQLite)
```

### Logout Flow (guarded — prevents data loss)

```
1. User taps "Sign Out"
2. Check useSyncStore.pendingChanges — are there unsynced local changes?
   - YES: show blocking modal "You have X unsynced changes"
     → "Sync & Sign Out" button: push changes → wait → then logout
     → "Cancel": return to settings (user stays logged in)
   - NO: proceed directly to step 3
3. Call POST /api/Auth/logout + DELETE /api/Device/unregister
4. Drop all local SQLite tables (wipe all local data)
5. Clear SecureStore (keep biometric_token if enabled)
6. Navigate to LoginScreen
```

### Offline Behavior

- While offline: all creates/updates write to local SQLite only
- `useSyncStore.pendingChanges[]` tracks every local operation with entity type, data, timestamp
- List screens render from SQLite — OfflineBanner visible when `NetInfo.isConnected = false`
- On connectivity restore: auto-trigger sync flow (push → drop → pull → rebuild)
- On app open (already logged in): auto-trigger full-pull to get fresh data
- App size stays small — local DB is rebuilt from scratch every sync, never accumulates

### Sync Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/Sync/push` | POST | Upload all pending local changes; returns per-item accepted/rejected |
| `/api/Sync/full-pull` | POST | Returns ALL data for the user (admin=all, staff=scoped); mobile rebuilds local DB from this |
| `/api/Sync/ping` | GET | Returns server time; used to confirm connectivity |

All Orval-generated API functions go through the shared `axiosInstance.ts` which handles token injection + 401 refresh automatically.

---

## Implementation Order

Build in this exact priority:

1. Orval setup: `orval.config.ts`, `src/api/axiosInstance.ts`, run `yarn orval` to generate typed API client
2. Navigation skeleton (auth stack + tab navigator + More stack)
3. Shared components: AmountText, StatusBadge, SearchableModal, SkeletonLoader, SyncStatusBar, OfflineBanner, PDFViewerModal
4. Auth screens: Login, BiometricLogin, ForgotPassword
5. Dashboard (calls `GET /api/Dashboard/summary` + `GET /api/Dashboard/monthly-overview`)
6. Clients (List, Detail, Form)
7. Orders (List, Detail, Create)
8. Payments (List, Record)
9. Invoices (List, Detail + PDF viewer)
10. Products (List, Detail, Form)
11. Purchases (List, Detail, Create)
12. Expenses (List, Add)
13. Stock Movements (List, Add)
14. Transactions (List)
15. Reports hub + all 5 report screens with charts and PDF viewers
16. Users (List, Create) — Admin only
17. Sync Status screen
18. Settings + Change Password + Biometric toggle in Settings
19. Push notification registration modal
20. Biometric login flow (BiometricLoginScreen + setup/disable in Settings)
21. Notification center screen + NotificationBanner overlay + `useNotificationListeners` hook

Every screen must handle three non-happy states: loading (skeleton shimmer), empty (illustration + action CTA), and error (message + retry button). Offline state shows cached data + OfflineBanner.
