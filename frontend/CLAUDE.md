# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Always read the exact versioned Expo docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo-specific code.**

## Form Rules (MANDATORY — enforced on every form, no exceptions)

Every form screen must follow all four rules below. Missing any one is a bug.

### 1. Formik + Yup — always, no manual useState for form state

- Every form hook uses `useFormik<FormValues>()` — never `useState` for `values`, `errors`, or `touched`.
- Yup schema in `src/utils/validation/<feature>Validation.ts`, named `<action><Feature>Step<N>Schema` for wizard steps or `<feature>ValidationSchema` for single-step forms.
- `validateOnBlur: true`, `validateOnChange: false` on every formik instance.
- For multi-step wizards: call `yupSchema.validate(formik.values, { abortEarly: false })` in `onNext`; set `formik.setFieldTouched` / `formik.setFieldError` on failure. Do **not** attach `validationSchema` to formik for wizard forms.
- `onSubmit` in the hook returns `formik.handleSubmit` — the component button calls it. The hook itself never calls `formik.handleSubmit()` internally.
- `submitting` is `formik.isSubmitting`, never a manual `useState` flag.
- For edit forms that load async data: use `formik.resetForm({ values: filled })` inside a `useEffect` when the data arrives.
- Line-level stock availability (`lineErrors`, `lineAvailability`) is **not** Formik state — keep those as `useState` since they're derived from external product data, not form validation.

```ts
// ✅ correct
const formik = useFormik<MyFormValues>({
  initialValues: { ... },
  validateOnBlur: true,
  validateOnChange: false,
  onSubmit: async (values, helpers) => { ... },
});
// hook returns: onSubmit: formik.handleSubmit

// ❌ wrong — manual form state
const [values, setValues] = useState<MyFormValues>({ ... });
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
```

### 2. KeyboardAvoidingView — required in every form component

Every form component must wrap its scrollable content in `KeyboardAvoidingView` with correct behavior and offset:

```tsx
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === AppConstants.PLATFORM.OS.IOS ? 'padding' : 'height'}
  keyboardVerticalOffset={0}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* form fields */}
  </ScrollView>
</KeyboardAvoidingView>
```

### 3. Return key chains focus between fields

In every `LineItemFormCard` and single-step form, text inputs must chain focus via `returnKeyType` and `onSubmitEditing`:

- Numeric/text field that is NOT the last field: `returnKeyType="next"` + `onSubmitEditing={() => nextFieldRef.current?.focus()}`
- Last field in a form or card: `returnKeyType="done"`
- Multiline fields: `AppInputField` overrides to `returnKeyType="default"` automatically — no action needed
- Use `useRef<TextInput>(null)` inside the card component and pass it via `ref` to `AppInputField` (which is `React.forwardRef`-wrapped)

```tsx
// ✅ correct — LineItemFormCard
const unitCostRef = useRef<TextInput>(null);
<AppInputField keyboardType="numeric" returnKeyType="next" onSubmitEditing={() => unitCostRef.current?.focus()} />
<AppInputField ref={unitCostRef} keyboardType="decimal-pad" returnKeyType="done" />
```

### 4. Last field submission

On single-step forms, the last non-multiline field's `onSubmitEditing` should trigger the primary action (`onNext` or `formik.handleSubmit`). Wire it from the component — do not call `formik.handleSubmit` from the hook.

---

## PDF Download Rule

**Any screen that has a corresponding PDF endpoint must always include a PDF download button using `<PdfButton>` from `@components/common/PdfButton`.**

- List screens (e.g. `GET /Client/pdf`) → add `PdfButton` in the list header row next to the menu icon
- Detail screens (e.g. `GET /Client/{id}/pdf`) → add `PdfButton` in the detail header/toolbar actions
- Use `usePdfDownload()` hook from `@hooks/usePdfDownload` to wire the download
- Use `downloadAndOpenPdf(urlPath, filename)` from `@core/pdf` for the actual download + share flow
- PDF opens in the system viewer (iOS Quick Look / Android share dialog) for preview before saving

## Design Reference

All screens must be implemented pixel-accurately from the v3 design prototype:

```
frontend/textile-erp/project/design_handoff_hamzatex_erp/
  README.md                    ← start here (implementation guide)
  mobile-design-prompt.md      ← full 37-screen spec with exact backend endpoints per screen
  proto/v3/
    tokens.jsx                 ← colors, type scale, radii, shadows, status badge map (source of truth)
    icons.jsx                  ← ~60 SVG icons used in the design
    ui.jsx                     ← shared primitives reference: Btn, Card, Input, Badge, Row, StatCard, etc.
    screens-<section>.jsx      ← one file per section; every px and hex is explicit in source
  app-icons/                   ← production iOS + Android icon set
```

**Before implementing any screen**, read the corresponding `screens-*.jsx` file. Every value — padding, color, font weight, radius — is spelled out in the source.

---

## Commands

```bash
yarn install
yarn start              # Metro dev server
yarn ios                # build + run on iOS simulator
yarn android            # build + run on Android emulator
yarn test
```

**Regenerate API client from backend spec** (after backend changes):

```bash
# 1. Download fresh spec from running backend
curl http://localhost:5000/api/App/spec -o openapi-spec.json
# 2. Regenerate
npx orval
```

**After `expo prebuild --clean`**, re-apply this manually to `ios/Pods/Podfile` (gets wiped on each clean):

```ruby
use_modular_headers!
```

---

## Architecture

### Folder Structure & Separation of Concerns

Every feature follows this exact layout — do not deviate:

```
src/
├── screens/<feature>/index.tsx         — logic only: calls hooks, passes props to component
├── components/<feature>/
│   ├── index.tsx                       — UI only, receives everything via props
│   └── styles.ts                       — StyleSheet, exported and imported in index.tsx
├── hooks/use<Feature>.ts               — all hooks, used in screens
├── core/<domain>.ts                    — business + API logic per domain area
├── constants/                          — all app-wide constants (colors, action names, keys)
├── utils/helpers/<name>.ts             — pure utility functions, no React
├── stores/                             — Zustand global state
├── navigation/                         — navigator files only
├── api/
│   ├── generated/<tag>/               — Orval-generated React Query hooks (DO NOT EDIT)
│   └── models/                        — Orval-generated TypeScript types (DO NOT EDIT)
├── theme/                             — colors, typography, spacing
├── types/                             — shared TypeScript types
└── locales/                           — i18n JSON files
```

**Rules:**

- Screens hold logic; components hold UI. Components never import from `core/` or call hooks directly.
- Hooks live in `hooks/` and are passed as props (or their return values passed) into components.
- All constants — colors, SecureStore keys, role IDs, pagination defaults — go in `constants/`, never hardcoded inline.
- `src/theme/` is for design tokens (colors, typography, spacing). `src/constants/` is for application constants (`AppConstants`).

### Path Aliases

All `src/` subfolders have TypeScript path aliases configured in `tsconfig.json`:

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@api/*`        | `src/api/*`        |
| `@stores/*`     | `src/stores/*`     |
| `@screens/*`    | `src/screens/*`    |
| `@components/*` | `src/components/*` |
| `@hooks/*`      | `src/hooks/*`      |
| `@utils/*`      | `src/utils/*`      |
| `@theme/*`      | `src/theme/*`      |
| `@constants/*`  | `src/constants/*`  |
| `@navigation/*` | `src/navigation/*` |
| `@db/*`         | `src/db/*`         |
| `@types/*`      | `src/types/*`      |
| `@locales/*`    | `src/locales/*`    |

Always use aliases, never relative paths crossing folder boundaries.

### API Layer (Orval + React Query)

- All API hooks in `src/api/generated/` are **auto-generated by Orval** — never edit these files.
- The mutator is `src/utils/axiosInstance.ts` — a single Axios instance with JWT bearer injection and automatic token refresh on 401.
- Tokens are stored in `expo-secure-store` under keys defined in `AppConstants.SECURE_STORE`.
- The `API_URL` comes from `app.config.js` `extra.apiUrl`, sourced from the `API_URL` env var (defaults to `http://localhost:5000/api`).

### State Management

Two Zustand stores:

- `authStore` — `userId`, `roleId`, `userName`, `isAuthenticated`. `hydrate()` reads SecureStore on app start; `setAuth()` / `clearAuth()` manage login/logout.
- `metaStore` — holds the full lookup table snapshot from `GET /api/Meta/all`, populated in `App.tsx` on every login/auth change via `fetchMeta()`. Use `AppConstants.META.*` keys to access lists: `getList(AppConstants.META.PAYMENT_TYPES)`, `getLookupName(AppConstants.META.ORDER_STATUSES, id)`.

### Navigation

- `RootNavigator` — switches between `AuthNavigator` and `MainNavigator` based on `isAuthenticated`.
- `AuthNavigator` — native stack: Splash → Welcome → Onboarding → Login → Biometric → ForgotPassword → VerifyOtp → ResetPassword (also Register, Terms, Privacy). Password reset is OTP-based: ForgotPassword calls `POST /api/auth/forgot-password` (returns `nextResendAt`); VerifyOtp calls `POST /api/auth/verify-reset-otp` with `{ email, code }` (returns `resetToken`); ResetPassword calls `POST /api/auth/reset-password` with `{ email, resetToken, newPassword, confirmPassword }`. The email is carried client-side through all three screens — the backend never returns it. VerifyOtp shows a 30-second resend cooldown timer using `nextResendAt`.
- `MainNavigator` — **side drawer** (`@react-navigation/drawer`, width 296, `drawerType: 'front'`, swipe disabled). `DrawerContent` renders `DrawerComponent` which shows user name, role, and sign-out. Drawer screens:
  - `Dashboard` (direct screen — no stack)
  - `ClientsStack`, `OrdersStack`, `ProductsStack`, `PurchasesStack`, `PaymentsStack`, `InvoicesStack`, `ExpensesStack`, `StockStack`, `LedgerStack`
  - `ReportsStack`, `UsersStack` — Admin only (roleId === 1)
  - `Settings` (placeholder)
- **Note on design spec deviation:** The v3 design prototype specifies bottom tabs (Home/Clients/Orders/Payments/More). The implementation uses a side drawer instead. Do not change this — the drawer is the intentional production choice.
- All screen param types are in `src/types/navigation.types.ts`.

### Theme

| File                  | Contents                                                   |
| --------------------- | ---------------------------------------------------------- |
| `theme/colors.ts`     | Full color palette — always import from here               |
| `theme/typography.ts` | Quicksand font families, font sizes, weights, line heights |
| `theme/spacing.ts`    | Spacing scale                                              |
| `theme/index.ts`      | Re-exports all theme tokens                                |

Font family names: `Quicksand-Regular`, `Quicksand-Medium`, `Quicksand-SemiBold`, `Quicksand-Bold` (statically bundled via expo-font plugin in `app.config.js`).

### Splash Screen

`react-native-bootsplash` v7. `BootSplash.hide({ fade: true })` is called in `App.tsx` after `authStore.hydrate()` resolves. The storyboard is `BootSplash.storyboard`; init is wired in `AppDelegate.swift` via `RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)` inside `customize(_:)`.

### App Entry

`App.tsx` → hydrates auth from SecureStore → hides splash → renders `<QueryClientProvider><RootNavigator /></QueryClientProvider>`.

---

## Coding Rules

### 1. TypeScript — Types & Interfaces

- **Always use `export type`, never `export interface`.**
- **Every `type` declaration — without exception — lives in `src/types/`.** This includes store shapes, nav prop aliases, internal component props, helper input/output shapes, everything. No `type` or `interface` keyword anywhere outside `src/types/`.
- File naming: `src/types/<feature>.types.ts`. If a type is for a store, name it `<storeName>.types.ts`.
- Nav prop aliases belong in `src/types/navigation.types.ts` and should use generic helpers (see Navigation section).
- Orval-generated models in `src/api/models/` are the source of truth for API shapes — never redefine them.

```ts
// ✅ correct — type declared in src/types/login.types.ts, imported where needed
import { LoginFormValues } from '@types/login.types';

// ❌ wrong — type defined inline in a hook, component, store, screen, or util
type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>; // inside useLogin.ts
interface AuthStore extends AuthState { ... }                                // inside authStore.ts
```

### 2. Constants — No Magic Numbers or Hardcoded Strings

- Every fixed value — OTP length, pagination size, SecureStore keys, role IDs, timeouts — goes in `AppConstants` (`src/constants/appConstants.ts`).
- Never write a raw number or string literal where a named constant exists.

```ts
// ✅ correct
AppConstants.OTP.LENGTH;

// ❌ wrong
const OTP_LENGTH = 6; // inside a component or hook
digits.length < 6; // magic number inline
```

### 3. Architecture — Layer Responsibilities

| Layer                      | What it does                                                   | What it must NOT do                                     |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `screens/<f>/index.tsx`    | Calls hooks, reads route params, passes props down             | Contain JSX layout, call API directly                   |
| `components/<f>/index.tsx` | Renders UI from props only                                     | Import from `core/`, call hooks, contain business logic |
| `components/<f>/styles.ts` | `StyleSheet.create(...)` only                                  | Import anything except `@theme/*`                       |
| `hooks/use<Feature>.ts`    | State, timers, handlers, Formik, API orchestration             | Render JSX                                              |
| `core/<domain>.ts`         | Raw async API calls, SecureStore reads/writes, store mutations | React hooks, JSX                                        |
| `utils/helpers/<name>.ts`  | Pure functions, no React                                       | Side effects, API calls                                 |

### 3a. Data Mapping — Always in Helpers, Never Inline

Any function that transforms, maps, or shapes data — whether from the API, SQLite, or any other source — must live in `src/utils/helpers/`. This keeps components and hooks clean and makes mapping logic independently testable.

**This covers:**

- API response → component prop shape (e.g. `mapOrderToRow`)
- DB row → domain model (e.g. `mapDbClientToClient`)
- Number/date/string formatting (e.g. `formatCompactNumber`, `formatDate`)
- Static display data structures with icon/color/label configs (e.g. `FORGOT_PASSWORD_STEPS`)
- Any `Array.map / .filter / .reduce` whose callback contains logic beyond a simple prop access

```ts
// ✅ correct — transform lives in utils/helpers/orderMappers.ts
import { mapOrderToRow } from '@utils/helpers/orderMappers';
const rows = orders.map(mapOrderToRow);   // in hook, rows passed as prop to component

// ❌ wrong — mapping logic inline in hook or component
const rows = orders.map((o) => ({
  id: o.orderId,
  label: `#${o.orderId} · ${o.clientName}`,
  total: formatCompactNumber(o.total),
}));

// ✅ correct — formatter in utils/helpers/formatNumber.ts
import { formatCompactNumber } from '@utils/helpers/formatNumber';

// ❌ wrong — formatter defined at top of component file
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

// ✅ correct — static display config in utils/helpers/forgotPasswordContent.ts
import { FORGOT_PASSWORD_STEPS } from '@utils/helpers/forgotPasswordContent';

// ❌ wrong — display config array built inside component body
const steps = [{ Icon: MailIcon, bg: colors.primaryLight, label: t('forgotPassword.step1') }];
```

**Naming conventions for helper files:**

- Mappers: `src/utils/helpers/<feature>Mappers.ts` — exports `map<Source>To<Target>` functions
- Formatters: `src/utils/helpers/format<Domain>.ts` — exports `format<Thing>` functions
- Static configs: `src/utils/helpers/<feature>Content.ts` — exports `SCREAMING_SNAKE_CASE` constants

**Icon component references in content helpers:**
Helper files are `.ts` (no JSX), so icon maps store `ComponentType` references — not factory functions that return JSX. The component receives the map and renders the icon itself.

```ts
// ✅ correct — orderContent.ts (stays .ts, no JSX)
import type { ComponentType } from 'react';
import { ClockIcon, TruckIcon } from '@constants/svgAssets';

export const ORDER_STATUS_ICONS: Record<number, ComponentType<{ size?: number; color: string }>> = {
  [AppConstants.ORDER_STATUS.PENDING]: ClockIcon,
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: TruckIcon,
};

// In the component — a local render helper bridges the gap
const renderStatusIcon = (statusId: number, color: string, size: number): React.ReactNode => {
  const Icon = ORDER_STATUS_ICONS[statusId];
  return Icon ? <Icon size={size} color={color} /> : null;
};

// ❌ wrong — factory functions returning JSX inside a .ts helper or in the component file
const STATUS_ICONS: Record<number, (fg: string, size?: number) => React.ReactNode> = {
  [AppConstants.ORDER_STATUS.PENDING]: (fg, size = 14) => <ClockIcon size={size} color={fg} />,
};
```

### 3b. Sub-components — Always Folders, Never Inline Render Functions

Any piece of UI complex enough to be extracted must become a proper sub-component folder with its own `index.tsx` and `styles.ts`. **Never extract UI into a `render*` function inside the parent component** — that is just an inlined component without the folder structure.

```
components/<Feature>/
  index.tsx          ← parent component
  styles.ts          ← parent styles only
  <SubComponent>/
    index.tsx        ← sub-component, receives props
    styles.ts        ← sub-component styles only
```

**Rule of thumb:** if you find yourself writing `const renderSomething = () => { ... return <View>...</View> }` inside a component, that function should be a sub-component folder instead.

```tsx
// ✅ correct — TabContent is a proper sub-component folder
// components/clients/ClientDetailComponent/TabContent/index.tsx
export const TabContent = ({ tab, client }: ClientTabContentProps) => { ... };

// In parent:
import { TabContent } from './TabContent';
<TabContent tab={tab} client={client} />

// ❌ wrong — render function living inside the parent component body
const renderTabContent = () => {
  // ...switch on tab, map rows...
  return rows.length === 0 ? <EmptyState /> : rows;
};
// used as: {renderTabContent()}
```

**Styles follow the same boundary:** styles used only by a sub-component go in the sub-component's `styles.ts`, not the parent's. Never pass style objects as props to pull parent styles into a sub-component.

### 4. Props Pattern

- Hooks return a flat object; screens spread it directly into the component: `<FooComponent {...handlers} />`.
- Components receive everything via props — no internal hook calls, no `useNavigation`, no `useRoute`.
- Exception: `useSafeAreaInsets` and `useTranslation` are purely presentational and are allowed inside components.

### 5. Forms — Formik + Yup

- Every form uses Formik. Form values type lives in `src/types/<feature>.types.ts`.
- Yup schema lives in `src/utils/validation/<feature>Validation.ts`, exported as `<feature>ValidationSchema`.
- Password fields must enforce: min 8 chars, 1 uppercase, 1 number, 1 special character.
- Never call `formik.handleSubmit()` from a hook — only from the component's button `onPress`.
- Validation runs on blur (`validateOnBlur: true` default). Field errors shown only after `touched`.

```ts
// ✅ password schema
Yup.string()
  .min(8, 'At least 8 characters required')
  .matches(/[A-Z]/, 'Must contain at least one capital letter')
  .matches(/[0-9]/, 'Must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character');
```

### 6. API & Service Layer

- **Never call Orval-generated functions directly from hooks or screens.** All API calls go through `src/core/<domain>.ts` wrapper functions.
- Backend responses are always `{ success, data, message, errors[] }`. Unwrap in `core/`:

```ts
// ✅ pattern in core/auth.ts
const res = response as unknown as { success: boolean; data?: T; message?: string };
if (!res.success) return { success: false, error: res.message ?? 'Fallback error' };
return { success: true, ...res.data };
```

- Return shape from `core/` functions: `{ success: boolean; error?: string; <dataFields>? }`.
- Catch block extracts server message: `err?.response?.data?.message ?? 'Fallback'`.
- Never `throw` from `core/` functions — always return `{ success: false, error }`.

### 7. Navigation

- All screen params are typed in `src/types/navigation.types.ts` — update this file before adding a new screen.
- Use `useNavigation` and `useRoute` only in `screens/` — pass callbacks as props to components.
- `navigate()` calls use the exact param types declared in `AuthStackParamList` / `MainTabParamList`.

### 8. i18n — Zero Hardcoded Text

**Every user-visible string must be a `t()` call. No exceptions for any JSX text.**

This covers — without exception:

- All `<Text>` content in components and screens
- All `placeholder=` values on `TextInput`
- All toast titles and bodies passed to `showSuccess()` / `showError()` in hooks
- All button labels, error messages, hint text, section headings
- All `accessibilityLabel` and `accessibilityHint` values

The only allowed hardcoded strings:

- Brand identity constants in `AppConstants.APP` (e.g. `AppConstants.APP.NAME`, `AppConstants.APP.TAG`) — these are invariant identifiers, not translatable copy.
- SVG/icon `color=` prop values — these are color references, not text.
- Developer-facing error strings in `catch` blocks inside `core/` (never shown in the UI).

```tsx
// ✅ correct
<Text>{t('login.welcomeBack')}</Text>
<TextInput placeholder={t('login.usernamePlaceholder')} />
showError(t('login.errorTitle'), result.error ?? t('login.errorSubtitle'));
<Text>{AppConstants.APP.NAME}</Text>   // brand name constant, not copy

// ❌ wrong — hardcoded English in JSX/hooks
<Text>Welcome back</Text>
placeholder="Enter your username"
showError('Login Failed', result.error);
```

Add new locale keys to `src/locales/en.json` **before** writing the component that uses them.

### 9. Styles

- All styles are in `components/<feature>/styles.ts` as a single `StyleSheet.create({})` export named `styles`.
- Import only from `@theme/colors` and `@theme/typography` — never hardcode color hex values or font names in styles.
- No inline `style={{ ... }}` objects except for dynamic values (e.g. `paddingTop: insets.top + 12`).

### 10. Imports Order

Follow this order in every file, separated by blank lines:

```ts
// 1. React / React Native core
import React from 'react';

import { Text, View } from 'react-native';

// 2. Third-party libraries
import { useFormik } from 'formik';

// 3. Alias imports (@stores, @hooks, @components, @constants, @theme, @utils, @api)
import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

// 4. Relative imports (types, sibling files)
import { LoginFormValues } from '../../types/login.types';
import { styles } from './styles';
```

### 11. List Screens — Pagination, Memoization & Loading

Every list screen (Clients, Products, Orders, Purchases, Payments, Invoices, Expenses, Stock Movements, Transactions) must follow these rules. Copy the **Clients / Products / Orders** implementations as the template — do not hand-roll a new pattern.

**Pagination — always infinite-query the paginated endpoint, never fetch-all:**

- The hook uses `useInfiniteQuery`, **not** `useQuery`. A one-shot `useQuery` over an unbounded `GET all`/`GET /me` endpoint breaks down as the dataset grows and silently truncates if capped with a magic `pageSize`.
- Page size comes from `AppConstants.PAGINATION.DEFAULT_PAGE_SIZE` — **never hardcode** a `pageSize` literal (e.g. `pageSize: 100`). That is a magic-number violation _and_ a silent truncation bug past that count.
- The `core/<domain>.ts` fetcher returns `{ items: Row[]; hasNextPage: boolean }`, unwrapping `PagedList<T>` from the API:
  ```ts
  export const fetchXPageAsync = async (page, pageSize) => {
    const res = await xGetAllPaginated({ page, pageSize });
    const r = parseApiResponse<XDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return { items: (r.data.items ?? []).map(mapXToRow), hasNextPage: !!r.data.hasNextPage };
  };
  ```
- Role scoping is **server-side** — the paginated endpoint scopes by `isAdmin` internally (Admin sees all, Staff sees their own). The frontend hits the same endpoint for both roles; do not branch the fetch on `roleId` client-side.

**Memoization — avoid re-rendering every row on each keystroke:**

- The row card (`ClientRowCard`, `ProductCard`, `OrderCard`, …) is wrapped in `React.memo`.
- In the list component, `renderItem`, `ItemSeparatorComponent`, and `ListFooterComponent` are each wrapped in `useCallback` (deps = the callbacks they close over). Never pass an inline arrow to those props.

**Loading states — the "load more" footer reuses the same skeleton row as the initial load:**

- Extract one reusable `SkeletonRow/` sub-component folder (`index.tsx` + `styles.ts`) per list. The full-screen `<FeatureListSkeleton />` and the paginated `ListFooterComponent` **both render `SkeletonRow`**, so initial load and "load more" look identical. Never use a bare `<ActivityIndicator>` spinner for the footer.
- Skeleton pulse timing uses `AppConstants.SKELETON` (`PULSE_DURATION_MS`, `PULSE_MIN_OPACITY`, `LIST_PLACEHOLDER_COUNT`) — never inline `700` / `0.4` / `[1,2,3,4]` literals.

**Required hook return shape** (spread into the component by the screen):

```ts
{
  rows, totalCount, loading, refreshing, isFetchingNextPage,
  onRefresh, onEndReached, /* + feature-specific filters/handlers */
}
```

`onEndReached` calls `fetchNextPage()` only when `hasNextPage && !isFetchingNextPage`. The component wires `onEndReached` + `onEndReachedThreshold={0.5}` onto the `FlatList`.

---

## Implementation Status

Done: Auth flow, Dashboard, Navigation skeleton, Orval API layer, `authStore`/`metaStore`, `core/` with shared `parseApiResponse`/`parseApiError`, Clients/Products/Orders features, common components, theme, i18n. The List-screen convention (Rule 11) is established — copy Clients/Products/Orders as the template.

Remaining feature screens (Purchases, Payments, Invoices, Expenses, Stock Movements, Transactions, Reports, Users, Settings, Change Password, Notification Center) and per-screen design refs are tracked in `todo/12-frontend.md`. Every screen needs: loading skeleton, empty state (illustration + CTA), error state (message + retry).

---

## Key Constraints

- **Expo SDK 56**, bare workflow (not managed). Use `expo prebuild` for native changes, not EAS Build locally.
- **React Native Firebase v24** — Firebase initialized in `AppDelegate.swift` and `MainActivity.kt`.
- **React Navigation v7**.
- `app.config.js` uses dynamic config (function form) — `extra.apiUrl` and `extra.appEnv` are injected at build time via env vars.
- Bundle ID: `com.hamzatex.app` (iOS + Android).
