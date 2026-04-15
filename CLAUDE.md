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

Swagger UI: `http://localhost:5000/swagger`. OpenAPI JSON spec: `http://localhost:5000/swagger/v1/swagger.json`. Download spec for Orval: `GET /api/App/spec`. Auto-migrates and seeds on startup.

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
| `PurchaseStatus` | Pending (1), InProgressed (2), Delivered (3), Cancelled (4) |
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
- `Purchase` — `SupplierId` (FK → `Client` where `ClientTypeId=2`), `StatusId` (FK → `PurchaseStatus`), `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt`
- `PurchaseLine` — `PurchaseId`, `ProductId`, `Qty` (decimal 14,2), `UnitCost` (decimal 14,4)
- `PurchaseStatus` — lookup (Pending=1, InProgressed=2, Delivered=3, Cancelled=4); seeded on startup

**Financials**
- `Payment` — `PartyClientId` (FK → Client), `PaymentDirectionId`, `TransModeId`, `Amount`, `PaymentDate`, `Notes`, `CreatedAt`
- `Expense` — `ExpenseTypeId`, `Amount`, `TransModeId`, `UserId`, `TransCategoryId`, `TransactionId` (optional link), `ExpenseDate` (DateOnly), `Notes`, `CreatedAt`
- `Transaction` — `ClientId?`, `ProductId?`, `UserId`, `OrderId?` (FK → Order), `PurchaseId?` (FK → Purchase), `TransTypeId`, `TransModeId`, `TransCategoryId`, `Amount`, `TransDate` (DateOnly), `Notes`, `CreatedAt`; owns `Expense[]`

**Reporting Views (read-only)**
- `VMonthlyProfitLoss` — `Month`, `TotalSales`, `TotalPurchases`, `TotalExpenses`, `GrossProfit`, `NetProfit`
- `VClientBalance` — `ClientId`, `Name`, `Balance`
- `VMonthlyCreditDebit` — `Month`, `TotalCredit`, `TotalDebit`, `Balance`

### Key Business Rules

- **Stock movement source drives direction — never set MovementType manually for Purchase/Sale:**
  - `MovementSource = 1 (Purchase)` → `MovementType` is auto-set to `1 (In)`, stock increases, weighted avg cost recalculated
  - `MovementSource = 2 (Sale)` → `MovementType` is auto-set to `2 (Out)`, stock decreases, weighted avg price recalculated
  - `MovementSource = 3 (Manual)` → caller must supply `MovementType`: `1 (In)`, `2 (Out)`, or `3 (Adjustment)`
  - `MovementType = 3 (Adjustment)` records the event but makes no automatic qty or average change
  - `CreateStockMovementsDto.MovementType` is `int?` — null is valid for Purchase and Sale sources
- **Weighted average cost:** Handled inside `StockMovementsService.CreateAsync` for In movements: `AverageCost = (oldAvgCost * oldQty + newUnitCost * newQty) / (oldQty + newQty)`. Increments `TotalQuantityPurchased` and `CostChangeCount` on the product.
- **Weighted average price:** Handled inside `StockMovementsService.CreateAsync` for Out movements: `AveragePrice = (totalSoldBefore * prevAvgPrice + qty * unitPrice) / totalSoldNow`. Increments `TotalQuantitySold` and `PriceChangeCount`.
- **Calling StockMovementsService from other services (Orders, Purchases):** Inject `IStockMovementsService` and call `CreateAsync` with the correct `MovementSource`. Do NOT duplicate the quantity/average logic — it all lives in `StockMovementsService.CreateAsync`.
  ```csharp
  // From PurchaseService — MovementType omitted, auto-derived to In
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 1,
      Qty = line.Qty, UnitCost = line.UnitCost, MovementDate = purchaseDate
  }, userId);

  // From OrderService — MovementType omitted, auto-derived to Out
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 2,
      Qty = line.Qty, UnitPrice = line.UnitPrice, MovementDate = orderDate
  }, userId);

  // Cancel reversal (Manual In to put stock back)
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 3, MovementType = 1,
      Qty = line.Qty, MovementDate = DateOnly.FromDateTime(DateTime.UtcNow)
  }, userId);
  ```
- **Insufficient stock guard:** `StockMovementsService.CreateAsync` returns `ErrorResponse("Insufficient stock")` for Out movements when `Qty > Product.Quantity`. OrderService must check this and roll back the order.
- **Snapshot fields:** `AverageCostAtMovement` and `AveragePriceAtMovement` on `StockMovement` are computed at create time and stored as a historical snapshot. They are NOT recalculated on `UpdateByIdAsync` unless explicitly provided.
- **Supplier is a Client:** `Purchase.SupplierId` references `Client.Id` where `ClientTypeId = 2`
- **UserId scoping:** Products and Clients are scoped to their owner `UserId`; admins see all, staff see their own. Stock movements are scoped through `Product.ProductUsers`.
- **Ledger posting convention (critical — affects all 3 views):**
  - `v_monthly_profit_loss` uses `trans_category_id` (id-based): `1=Sales`, `2=Purchases`, `3/4=Expenses`. Amount is always positive.
  - `v_client_balance` sums raw `amount` per `client_id` — sign is in the amount value itself.
  - `v_monthly_credit_debit` uses `trans_type_id`: Credit=money in, Debit=money out.
  - **Order Delivered:** `TransCategoryId=1`, `TransTypeId=2 (Credit)`, `Amount=+total`, `OrderId` set
  - **Order Cancelled reversal:** `TransCategoryId=1`, `TransTypeId=1 (Debit)`, `Amount=-total`, `OrderId` set
  - **Purchase Delivered:** `TransCategoryId=2`, `TransTypeId=1 (Debit)`, `Amount=+total`, `PurchaseId` set
  - **Purchase Cancelled reversal:** `TransCategoryId=2`, `TransTypeId=2 (Credit)`, `Amount=-total`, `PurchaseId` set
  - **Payment Received (customer pays):** `TransCategoryId=5 (Cash In)`, `TransTypeId=2 (Credit)`, `Amount=+amount`, `ClientId=NULL`
  - **Payment Paid (supplier payment):** `TransCategoryId=6 (Cash Out)`, `TransTypeId=1 (Debit)`, `Amount=+amount`, `ClientId=NULL`
  - **Payment Reversed:** reversing Transaction posted with opposite TransType; original payment `IsReversed=true`
- **v_client_balance redesign:** View now joins `transactions` (order/purchase totals) against `payments` table directly (excluding `is_reversed=1`). Customers: `order_total - received_payments`. Suppliers: `purchase_total - paid_payments`.
- **PaymentAllocation:** join table linking Payment → Order/Purchase with `AllocatedAmount`. FIFO auto-allocation sorts non-Cancelled orders/purchases by date ASC and fills greedily when `Allocations` list is empty on create.
- **Line qty and price precision:** `order_lines.qty` / `purchase_lines.qty` = `decimal(14,2)`. `order_lines.unit_price` / `purchase_lines.unit_cost` = `decimal(14,4)` matching `stock_movements`.

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

**Controller requirements** — every controller must have:
- `[Produces("application/json")]` on the class
- `/// <summary>` XML doc comment on the class and every action method
- `[ProducesResponseType(...)]` on every action

**Controller userId extraction pattern** — use a private helper (established in `StockMovementsController`):
```csharp
private int? GetUserId()
{
    var claim = User.FindFirst(ClaimTypes.NameIdentifier);
    return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
}
```

**Service interface requirements** — every `IService` interface must have `/// <summary>` on the interface itself and on every method signature.

**Lookup / enum tables** — all accessible via `GET /api/Meta/{type}` (switch-case dispatch). Frontend calls `GET /api/Meta/all` on app startup and caches locally. Do not create separate controllers for read-only lookups — add to `ILookupService.GetByTypeAsync` switch instead.

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
| `IStockMovementsService` | CreateAsync, GetByIdAsync, GetAllAsync, GetAllPaginatedAsync, GetFilteredAsync, UpdateByIdAsync, DeleteByIdAsync |
| `IOrderService` | CreateAsync, GetByIdAsync, GetAllAsync, GetAllByUserIdAsync, GetAllPaginatedAsync, GetFilteredAsync, UpdateByIdAsync, DeleteByIdAsync |
| `IPurchaseService` | CreateAsync, GetByIdAsync, GetAllAsync, GetAllByUserIdAsync, GetAllPaginatedAsync, GetFilteredAsync, UpdateByIdAsync, DeleteByIdAsync |
| `IPaymentService` | CreateAsync, GetByIdAsync, GetAllPaginatedAsync, GetAllByUserIdAsync, GetAllByClientIdAsync, GetFilteredAsync, GetUnallocatedCreditAsync, UpdateByIdAsync, ReverseAsync, ReverseAndCorrectAsync, DeleteByIdAsync |
| `ILookupService` | GetAllAsync, GetByTypeAsync, GetOrderStatusesAsync, GetPurchaseStatusesAsync, GetPaymentTypesAsync, GetPaymentDirectionsAsync, GetTransTypesAsync, GetTransModesAsync, GetTransCategoriesAsync, GetExpenseTypesAsync, GetMovementTypesAsync, GetMovementSourcesAsync, GetClientTypesAsync, GetUserRolesAsync |
| `IPdfService` | CreatePdf |

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
| `StockMovementsController` | POST, GET (paginated), GET /{id}, GET /filtered, PUT /{id}, DELETE /{id}, GET /pdf |
| `OrderController` | POST, GET (paginated), GET /me, GET /{id}, GET /filtered, PUT /{id} (status transitions: Delivered→stock+ledger, Cancelled→reversal), DELETE /{id}, GET /pdf |
| `PurchaseController` | POST, GET (paginated), GET /me, GET /{id}, GET /filtered, PUT /{id} (status transitions: Delivered→stock In+ledger, Cancelled→reversal), DELETE /{id}, GET /pdf |
| `PaymentController` | POST (create + allocate), GET (paginated), GET /me, GET /{id}, GET /by-client/{clientId}, GET /filtered, GET /unallocated/{clientId}, PUT /{id}, POST /{id}/reverse, POST /{id}/reverse-and-correct, DELETE /{id}, GET /pdf |
| `MetaController` | GET /all, GET /{type} (switch-case dispatch for all 12 lookup tables incl. purchasestatuses) |
| `AppController` | GET /health, GET /info, GET /spec (downloads OpenAPI JSON for Orval) |

**Not yet created:** ExpenseController, TransactionController, ReportController, InvoiceController, SyncController, DeviceController

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
| `todo/01-stock-movements-read.md` | ✅ Complete |
| `todo/02-orders.md` | ✅ Complete — full Orders API incl. Delivered/Cancelled lifecycle, ledger, stock |
| `todo/03-purchases.md` | ✅ Complete — full Purchases API incl. Delivered/Cancelled lifecycle, ledger, stock, PurchaseStatus |
| `todo/04-payments.md` | ✅ Complete — full Payments API incl. FIFO allocation, reversal, reverse-and-correct, ledger posting, v_client_balance redesign |
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
