# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HamzaTex is a brownfield full-stack textile/trading ERP application (API + mobile) being evolved toward an **enterprise-ready, offline-first** system. Target users: staff in the field (mobile), accountants, managers, and admins.

**Core goal:** Correct data, no data loss when offline, and monthly reporting (P&L, client balances, movements) from a single source of truth.

- **Backend**: ASP.NET Core 9 Web API (`backend/HamzaTex.Api/`)
- **Frontend**: React Native + Expo (`frontend/`)

Planning artifacts (PRD, architecture decisions, epics): `_bmad-output/planning-artifacts/`

## Backend Commands

```bash
cd backend/HamzaTex.Api

# Run the API (dev mode)
dotnet run

# Build only
dotnet build

# Run tests
dotnet test

# Add EF migration
dotnet ef migrations add <MigrationName>

# Apply migrations
dotnet ef database update
```

**API runs at**: `http://localhost:5000`  
**Swagger UI**: `http://localhost:5000/swagger` (development only)

## Frontend Commands

```bash
cd frontend

# Install dependencies
yarn install

# Start Expo dev server
yarn start

# Platform-specific
yarn ios
yarn android
yarn web

# Run tests
yarn test
```

## Backend Architecture

### Database
- **MySQL 8.x** via Entity Framework Core with Pomelo driver
- Connection string in `appsettings.json`; auto-migrates and seeds on startup (`Program.cs`)
- `ApplicationDbContext` extends `IdentityDbContext<ApplicationUser, IdentityRole<int>, int>`
- DB views for reporting: `VClientBalance`, `VMonthlyProfitLoss`, `VMonthlyCreditDebit`

### Authentication & Authorization
- **ASP.NET Identity** for user management (migrated from a previous custom auth approach)
- **JWT Bearer tokens** + refresh token rotation (`RefreshToken` entity, `RefreshTokenService`)
- `JwtHelper` static class (configured once in `Program.cs`) generates and validates tokens
- Token claims: `UserId` (NameIdentifier), `Email`, and `RoleId`
- Custom authorization policies (resolved via `RoleId` claim, **not** role name strings):
  - `AdminOnly` — RoleId = 1
  - `StaffOnly` — RoleId = 2
  - `AdminOrStaff` — RoleId = 1 or 2
  - `Authenticated` — any valid token
- All controllers require authentication by default via a global `AuthorizeFilter` in `Program.cs`
- Email confirmation is required (`options.SignIn.RequireConfirmedEmail = true`); SMTP configured for Gmail

### Response & Controller Pattern
Every API response is wrapped in `Helpers/Response<T>`:
```csharp
Response<T>.SuccessResponse(data)
Response<T>.ErrorResponse("message", errors)
```
All controllers extend `BaseController`, which provides `ToActionResult()` to map `Response<T>` to 200/400/404.

### Validation
- **FluentValidation** with auto-validation; validators in `Validation/`
- `DataAnnotations` validation is explicitly disabled — all validation goes through FluentValidation
- `EmptyStringSchemaFilter` cleans up Swagger schema

### Service Layer
Interface + Scoped implementation pattern for every feature:
- `ILoginService` / `IRefreshTokenService` — auth flows
- `IUserService` / `IUserRoleService` — user and role management
- `IClientService` / `IClientTypeService` — client records and types
- `IProductService` — products with weighted average cost (`TotalBuying` / `TotalPurchasing`)
- `IStockMovementsService` — inventory movement tracking
- `IChangePasswordService` — authenticated password change
- `IPdfService` — PDF generation from `Helpers/pdf.html` template

### Key Domain Entities
- `Product` — `TotalBuying` / `TotalPurchasing` fields support weighted average cost calculation
- `StockMovement` — inventory changes tagged with `MovementType` and `MovementSource`
- `Client` — linked to `ClientType`; used in orders and payments; supports credit limit and opening balance
- `Order` / `OrderLine` — sales transactions linked to clients and products
- `Purchase` / `PurchaseLine` — purchase transactions
- `Payment` — linked to client/order/transaction; supports `PaymentDirection` and `PaymentType`
- `Expense` — expense records with `ExpenseType`
- `Transaction` — financial records with `TransCategory`, `TransMode`, `TransType`
- Lookup/enum tables: `ClientType`, `ExpenseType`, `MovementSource`, `MovementType`, `OrderStatus`, `PaymentDirection`, `PaymentType`, `TransCategory`, `TransMode`, `TransType`

### Models vs Entities
- `Entities/` — EF Core DB-mapped entities
- `Models/` — DTOs for controller request inputs (e.g. `ProductDto`, `ClientDto`)
- `Services/ViewModel/` — response view models returned from services to controllers

## Frontend Architecture

The frontend is currently in an **early/scaffold state** relative to the backend. The primary development effort has been on the backend.

- **Redux Toolkit** store (`src/store/`); only `itemsSlice` is wired — domain slices (clients, orders, products, auth) are not yet implemented
- **Axios** client in `src/utils/api.js` — base URL `http://localhost:5000/api`; auth token interceptor is stubbed (commented out) and needs implementation
- **React Navigation** stack navigator in `src/navigation/`
- Current screens: `HomeScreen`, `AddItemScreen`, `ItemDetailsScreen` (scaffold only)

### Planned Frontend Work (from epics)
- Replace `AsyncStorage` with **SQLite** for offline-first local persistence (Epic 7)
- Implement proper **token storage in secure enclave/keychain** (not plain AsyncStorage)
- Build domain screens: clients (Epic 3), products (Epic 4), orders (Epic 5), payments (Epic 6)
- Sync layer: queue of local changes, push/pull when online, conflict handling (Epic 7)
- **Push notifications** via FCM or Expo Push — provider TBD (Epic 10)

## Product Epics (Implementation Roadmap)

From `_bmad-output/planning-artifacts/epics.md`:

| Epic | Summary | Key FRs |
|------|---------|---------|
| 1 | Auth: sign-in, token refresh, change password, role enforcement | FR1–FR4, FR6 |
| 2 | Admin: manage users and roles | FR5, FR24, FR26 |
| 3 | Client management with pagination/filtering and type lookups | FR7, FR11, FR12, FR25 |
| 4 | Product management | FR9 |
| 5 | Order and order line management | FR8 |
| 6 | Payment recording | FR10 |
| 7 | Offline-first mobile: SQLite, sync, conflict handling, sync status | FR13–FR16 |
| 8 | Monthly reports: P&L, client balances, movements, export | FR17–FR19 |
| 9 | Invoicing, auditable records, data retention ≥ 1 year | FR20–FR22 |
| 10 | Push notifications for sync and alerts | FR23 |
| 11 | Input validation (backend authoritative) + reconciliation checks | FR27–FR28 |

## Architectural Decisions (from architecture.md)

Key decisions to respect when adding features:

- **Backend is source of truth.** Reports and accounting views come from backend data only. Mobile-only (unsynced) data is never used for reporting.
- **Sync is client-initiated.** Mobile detects connectivity and pushes/pulls; backend is stateless for sync.
- **Conflict resolution strategy is TBD** — must be documented when chosen (Epic 7, Story 7.3).
- **No API versioning for MVP.** No `/api/v1/` prefix yet; deferred post-MVP.
- **Push provider TBD** — FCM or Expo Push; store-compliant. Must document device token handling.
- **HTTPS + Bearer JWT** required for all API traffic in production.

## Configuration Notes

- JWT settings, SMTP config, DB connection string: `backend/HamzaTex.Api/appsettings.json`
- Update `frontend/src/utils/api.js` `API_BASE_URL` for non-localhost environments
- CORS is `AllowAll` in development — restrict for production in `Program.cs`
- `App:PublicBaseUrl` in `appsettings.json` is used for email confirmation links
