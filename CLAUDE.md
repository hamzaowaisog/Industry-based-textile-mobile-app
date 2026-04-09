# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HamzaTex is a brownfield full-stack textile/trading ERP (API + mobile) being evolved toward an enterprise-ready, offline-first system. Target users: staff in the field (mobile), accountants, managers, and admins.

**Core goal:** Correct data, no data loss when offline, monthly reporting (P&L, client balances, movements) from a single source of truth.

- **Backend:** ASP.NET Core 9, MySQL 8, EF Core — `backend/HamzaTex.Api/`
- **Frontend:** React Native + Expo (scaffold state) — `frontend/`
- **Planning docs:** `_bmad-output/planning-artifacts/` (PRD, architecture decisions, epics)
- **Remaining work tracker:** `todo/` (12 files, one per feature area)

---

## Commands

### Backend

```bash
cd backend/HamzaTex.Api

dotnet run                                        # start API on http://localhost:5000
dotnet build
dotnet test
dotnet ef migrations add <MigrationName>          # add EF migration
dotnet ef database update                         # apply migrations manually
```

Swagger UI: `http://localhost:5000/swagger` (dev only). Auto-migrates and seeds on startup.

### Frontend

```bash
cd frontend
yarn install
yarn start        # Expo dev server
yarn ios / yarn android / yarn web
yarn test
```

---

## Backend Architecture

### Request / Response Pattern

Every API response is wrapped in `Helpers/Response<T>`:

```csharp
Response<T>.SuccessResponse(data, "message")
Response<T>.ErrorResponse("message", errors)
Response.SuccessResponse("message")           // non-generic for void operations
```

All controllers extend `BaseController` (`Helpers/BaseController.cs`), which provides:
- `ToActionResult(Response<T>)` — maps to 200 / 400 / 404 based on `response.Success` and `response.Message`
- `ToValidationResponseFromModelState<T>()` — FluentValidation error helper

### Authentication & Authorization

- **ASP.NET Identity** (`ApplicationUser : IdentityUser<int>`) manages users
- **JWT Bearer** access tokens + refresh token rotation (`RefreshToken` entity)
- `JwtHelper` static class (configured once at startup) generates tokens
- JWT claims: `NameIdentifier` = userId, `Email`, `RoleId` (custom claim), `ClaimTypes.Role` = RoleId string
- All controllers require auth by default via a global `AuthorizeFilter` in `Program.cs`
- Authorization policies (resolved by `RoleId` integer claim, **not** role name string):
  - `AdminOnly` — RoleId = 1
  - `StaffOnly` — RoleId = 2
  - `AdminOrStaff` — RoleId = 1 or 2
  - `Authenticated` — any valid token
- Email confirmation required (`options.SignIn.RequireConfirmedEmail = true`). Admin-created accounts must be auto-confirmed (see `todo/09-users-admin-create.md`)

### Validation

- **FluentValidation** with auto-validation; all validators in `Validation/`
- `DataAnnotations` validation is explicitly disabled — use FluentValidation only
- Validators are named `<ViewModel>Validation` and registered automatically via assembly scan

### PDF Generation

`IPdfService` / `PdfService` generates PDFs from `Helpers/pdf.html` template.
`Models/PdfConfig.cs` contains `PdfColumnConfig`, `EntityPdfConfigs` (static configs per entity), and `EntityPdfConfigs.Filter(...)` helper.
Every list endpoint should have a corresponding `GET /pdf` endpoint using `IPdfService` + `EntityPdfConfigs.<Entity>`.

### Pagination

`Helpers/PagedList<T>` is the standard paginated response shape — used by Client and Product services. All new list endpoints should follow the same pattern: `GetAllPaginatedAsync(int page, int pageSize, ...)`.

### Database

- **MySQL 8.x** via EF Core with Pomelo driver
- `ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>`
- Migrations in `Migrations/`; auto-applied at startup via `dbContext.Database.Migrate()`
- Seed data applied via `SeedData.EnsureSeedDataAsync` at startup

### Seeded Lookup Data

All lookup tables are seeded on startup — **do not re-seed manually**:

| Table | Seeded Values |
|---|---|
| `UserRole` | Admin (1), Staff (2) |
| `ClientType` | Customer (1), Supplier (2) |
| `OrderStatus` | Pending (1), InProgressed (2), Delivered (3), Cancelled (4) |
| `PaymentType` | Cash (1), Credit (2) |
| `PaymentDirection` | Received (1), Paid (2), Adjustment (3) |
| `TransType` | Debit (1), Credit (2) |
| `TransMode` | Cash (1), Bank (2), Credit (3) |
| `TransCategory` | Sales (1), Purchases (2), Office Expenses (3), Home Expenses (4), Cash In (5), Cash Out (6), Bank In (7), Bank Out (8) |
| `ExpenseType` | Office Expenses (1), Home Expenses (2) |
| `MovementType` | In (1), Out (2), Adjustment (3) |
| `MovementSource` | Purchase (1), Sale (2), Manual (3) |

---

## Domain Model

### Entities (all in `Entities/`, all mapped in `ApplicationDbContext`)

**Users & Auth**
- `ApplicationUser` — extends `IdentityUser<int>`; has `Name`, `RoleId`, `IsActive`, `CreatedAt`; navigates to `UserRole`, `Transaction[]`, `Client[]`, `Expense[]`, `ProductUser[]`
- `UserRole` — custom role table (separate from ASP.NET Identity roles); `Id`, `Name`
- `RefreshToken` — `Token`, `UserId`, `ExpiresAt`, `CreatedAt`, `RevokedAt`, `ReplacedByToken`; `IsActive` and `IsExpired` are computed

**Clients**
- `Client` — `Name`, `ClientTypeId`, `UserId` (owner), `Phone`, `Address`, `CreditLimit`, `OpeningBalance`, `Notes`, `IsActive`, `CreatedAt`
- `ClientType` — lookup (Customer / Supplier); `ClientTypeId=2` clients are used as `Supplier` in `Purchase`

**Products & Inventory**
- `Product` — `Name`, `Sku` (unique), `Unit`, `DefaultCost`, `DefaultPrice`, `Quantity`, `AverageCost`, `AveragePrice`, `CostChangeCount`, `PriceChangeCount`, `TotalQuantityPurchased`, `TotalQuantitySold`, `ReorderLevel`, `IsActive`
- `StockMovement` — `ProductId`, `MovementTypeId`, `MovementSourceId`, `Qty`, `UnitCost`, `UnitPrice`, `AverageCostAtMovement`, `AveragePriceAtMovement`, `MovementDate`
- `ProductUser` — join table `(ProductId, UserId, Date)` — tracks which users work with which products

**Orders (Sales)**
- `Order` — `ClientId`, `StatusId`, `PaymentTypeId`, `OrderDate`, `Notes`, `CreatedAt`
- `OrderLine` — `OrderId`, `ProductId`, `Qty`, `UnitPrice`

**Purchases (Procurement)**
- `Purchase` — `SupplierId` (FK → `Client` where `ClientTypeId=2`), `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt`
- `PurchaseLine` — `PurchaseId`, `ProductId`, `Qty`, `UnitCost`

**Financials**
- `Payment` — `PartyClientId` (FK → Client), `PaymentDirectionId`, `TransModeId`, `Amount`, `PaymentDate`, `Notes`, `CreatedAt`
- `Expense` — `ExpenseTypeId`, `Amount`, `TransModeId`, `UserId`, `TransCategoryId`, `TransactionId` (optional link), `ExpenseDate` (DateOnly), `Notes`, `CreatedAt`
- `Transaction` — `ClientId?`, `ProductId?`, `UserId`, `TransTypeId`, `TransModeId`, `TransCategoryId`, `Amount`, `TransDate` (DateOnly), `Notes`, `CreatedAt`; owns `Expense[]`

**Reporting Views (read-only)**
- `VMonthlyProfitLoss` — `Month`, `TotalSales`, `TotalPurchases`, `TotalExpenses`, `GrossProfit`, `NetProfit`
- `VClientBalance` — `ClientId`, `Name`, `Balance`
- `VMonthlyCreditDebit` — `Month`, `TotalCredit`, `TotalDebit`, `Balance`

### Key Business Rules

- **Weighted average cost:** When a `Purchase` is created, update `Product.AverageCost = (oldAvgCost * oldQty + newUnitCost * newQty) / (oldQty + newQty)`, increment `TotalQuantityPurchased` and `CostChangeCount`
- **Stock levels:** Creating an `Order` should create a `StockMovement` (Out/Sale); creating a `Purchase` should create a `StockMovement` (In/Purchase). `StockMovementsService.CreateAsync` validates sufficient stock before outbound movements
- **Supplier is a Client:** `Purchase.SupplierId` references `Client.Id` where `ClientTypeId = 2`
- **UserId scoping:** Products and Clients are scoped to their owner `UserId`; admins see all, staff see their own

---

## Layer Conventions

Every feature follows this exact pattern — do not deviate:

```
Entities/<Entity>.cs                    — EF Core entity
Models/<Entity>Dto.cs                   — Dto, CreateDto, UpdateDto
Services/ViewModel/<Entity>ViewModel.cs — CreateViewModel, UpdateViewModel (input to controller)
Validation/<Entity>Validation.cs        — FluentValidation classes
Services/<Entity>Service.cs             — IService interface + Service class
Controllers/<Entity>Controller.cs       — extends BaseController
```

Register every new service as `Scoped` in `Program.cs`:
```csharp
builder.Services.AddScoped<IOrderService, OrderService>();
```

Add PDF config to `EntityPdfConfigs` in `Models/PdfConfig.cs` for every new entity that has a list endpoint.

---

## Existing Services Summary

| Interface | Methods present |
|---|---|
| `IUserService` | SignupAsync, GetByIdAsync, GetAllAsync, UpdateByIdAsync, DeleteByIdAsync, ResendEmailConfirmationAsync, ForgotPasswordAsync, ResetPasswordAsync, EmailConfirmationTokenAsync |
| `ILoginService` | LoginAsync, RefreshTokenAsync, LogoutAsync, LogoutAllAsync |
| `IRefreshTokenService` | CreateRefreshTokenAsync, GetRefreshTokenByTokenAsync, RevokeRefreshTokenAsync, RevokeAllUserTokensAsync, IsRefreshTokenValidAsync, CleanupExpiredTokensAsync |
| `IChangePasswordService` | ChangePasswordAsync |
| `IUserRoleService` | CreateAsync, GetByIdAsync, GetAllAsync, UpdateAsync, DeleteAsync |
| `IClientService` | CreateAsync, GetByIdAsync, GetAllAsync, GetAllByUserIdAsync, UpdateByIdAsync, DeleteByIdAsync, GetAllPaginatedAsync |
| `IClientTypeService` | CreateAsync, GetByIdAsync, GetAllAsync, UpdateByIdAsync, DeleteByIdAsync |
| `IProductService` | CreateWithUserIdAsync, GetByIdAsync, GetAllAsync, UpdateByIdAsync, DeleteByIdAsync, GetAllPaginatedAsync |
| `IStockMovementsService` | CreateAsync only — read/update/delete methods missing (see `todo/01`) |
| `IPdfService` | GeneratePdf |

---

## Existing Controllers & Endpoints

| Controller | Done endpoints |
|---|---|
| `AuthController` | POST register, login, logout, refresh, change-password, GET confirm-email, POST resend-email-confirmation, forgot-password, GET+POST reset-password |
| `UsersController` | GET /{id}, GET / (all), PUT /me, DELETE /{id}, GET /pdf — **missing POST (admin create)** |
| `UserRolesController` | POST, GET all, GET /{id}, PUT /{id}, DELETE /{id}, GET /pdf |
| `ClientController` | POST, GET all (AdminOnly), GET /me (scoped), GET /Filtered, GET /{id}, PUT /{id}, DELETE /{id}, GET /pdf |
| `ClientTypeController` | POST, GET all, GET /{id}, PUT /{id}, DELETE /{id}, GET /pdf |
| `ProductController` | POST, GET /{id}, GET all, GET /filtered, PUT /{id}, DELETE /{id}, GET /pdf |
| `StockMovementsController` | POST (create) only |

**Not yet created:** OrderController, PurchaseController, PaymentController, ExpenseController, TransactionController, ReportController, InvoiceController, SyncController, DeviceController

---

## Frontend State (scaffold only)

The frontend has no domain code. Current state:
- `App.js` → `AppNavigator` → stack of 3 generic screens (Home, AddItem, ItemDetails)
- Redux store: only `itemsSlice` (generic items CRUD)
- `src/utils/api.js`: Axios to `http://localhost:5000/api`; auth interceptor commented out; only generic item functions
- `src/components/`: `Button.js`, `Card.js` only
- No login screen, no token storage, no role-based navigation

See `todo/12-frontend.md` for the full frontend implementation plan.

---

## What Still Needs Building

See `todo/` for detailed task breakdowns:

| File | Area |
|---|---|
| `todo/01-stock-movements-read.md` | StockMovements read/update/delete (DTOs exist, just need service methods + endpoints) |
| `todo/02-orders.md` | Full Orders API — entity exists, nothing else |
| `todo/03-purchases.md` | Full Purchases API — entity exists, nothing else |
| `todo/04-payments.md` | Full Payments API — entity exists, nothing else |
| `todo/05-expenses.md` | Full Expenses API + ExpenseType controller |
| `todo/06-transactions.md` | Full Transactions API + lookup read endpoints |
| `todo/07-reports.md` | Expose VMonthlyProfitLoss, VClientBalance, VMonthlyCreditDebit views |
| `todo/08-invoices.md` | Invoice entity (doesn't exist) + full API |
| `todo/09-users-admin-create.md` | One new service method + one endpoint on UsersController |
| `todo/10-sync.md` | Backend sync push/pull (needs UpdatedAt migration + conflict strategy decision) |
| `todo/11-push-notifications.md` | Device token + push provider (Expo Push recommended) |
| `todo/12-frontend.md` | Everything on mobile |

---

## Configuration

- DB connection string, JWT settings, SMTP config: `backend/HamzaTex.Api/appsettings.json`
- Frontend API base URL: `frontend/src/utils/api.js` → `API_BASE_URL`
- CORS is `AllowAll` — restrict for production in `Program.cs`
- `App:PublicBaseUrl` is used in email confirmation links
