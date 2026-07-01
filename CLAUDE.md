# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HamzaTex is a brownfield full-stack textile/trading ERP (API + mobile). Target users: staff in the field (mobile), accountants, managers, and admins.

**Core goal:** Correct data, monthly reporting (P&L, client balances, movements) from a single source of truth. The app is fully online-only — the offline/SQLite sync architecture has been removed.

- **Backend:** ASP.NET Core 9, MySQL 8, EF Core — `backend/HamzaTex.Api/`
- **Frontend:** React Native + Expo (scaffold state) — `frontend/`
- **Planning docs:** `_bmad-output/planning-artifacts/` (PRD, architecture decisions, epics)
- **Remaining work tracker:** `todo/` (12 files, one per feature area)

> **`backend/README.md` is stale** — it describes the original SQLite/Item scaffold and does not reflect the current ERP codebase. Ignore it; this CLAUDE.md is the authoritative reference.

---

## Commands

### Backend

```bash
cd backend/HamzaTex.Api

dotnet run                                        # start API on http://localhost:5000
dotnet build
dotnet ef migrations add <MigrationName>          # add EF migration
dotnet ef migrations remove                       # undo last migration (before db update)
dotnet ef database update                         # apply migrations manually
```

> **No test project exists** — `dotnet test` will fail. Testing is done via Swagger UI or curl against the running API.

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

### Swagger Example Values

`Helpers/EmptyStringSchemaFilter.cs` is registered as a `SchemaFilter` in `Program.cs` (`c.SchemaFilter<EmptyStringSchemaFilter>()`).
It populates Swagger UI request body examples with domain-appropriate values (e.g. `username: "john_doe"`, `password: "@Secure123"`, `amount: 150000`, `sku: "FAB-001"`).
Rules: any property name ending in `Id` → `1`; known string fields mapped by name; known numeric fields mapped by name; unknown strings → `"string"`.
**Do not remove or replace this filter** — without it all string fields default to `""` in Swagger UI.

### PDF Generation

`IPdfService` / `PdfService` generates PDFs from `Helpers/pdf.html` template.
`Models/PdfConfig.cs` contains `PdfColumnConfig`, `EntityPdfConfigs` (static configs per entity), and `EntityPdfConfigs.Filter(...)` helper.
Every list endpoint should have a corresponding `GET /pdf` endpoint using `IPdfService` + `EntityPdfConfigs.<Entity>`.

### Pagination

`Helpers/PagedList<T>` is the standard paginated response shape — used by Client and Product services. All new list endpoints should follow the same pattern: `GetAllPaginatedAsync(int page, int pageSize, ...)`.

### Date Handling

- **All `CreatedAt` fields use `DateOnly`** (not `DateTime`) — no time precision needed
- **Exception:** `RefreshToken` keeps `DateTime` for `CreatedAt`, `ExpiresAt`, `RevokedAt` (token management needs time precision)
- **Server-assigned:** `CreatedAt` is not in any input ViewModel or CreateDto — the server sets it via `DateOnly.FromDateTime(DateTime.UtcNow)` in services
- **EF Core value converter:** `ApplicationDbContext.OnModelCreating` registers a global `DateOnly ↔ DateTime` converter so MySQL `datetime` columns map to C# `DateOnly` without schema changes
- **JSON output format:** `"dd MMM, yyyy"` (e.g. `"03 May, 2026"`) — configured in `Helpers/FlexibleDateOnlyJsonConverter.cs`
- **JSON input:** Accepts `yyyy-MM-dd`, ISO-8601 datetime strings, etc. — parsing is flexible via `FlexibleDateOnlyJsonConverter` / `FlexibleNullableDateOnlyJsonConverter`
- **Safety net converters:** `FlexibleDateTimeJsonConverter` / `FlexibleNullableDateTimeJsonConverter` handle any remaining `DateTime` fields (e.g. `RefreshToken`) with graceful fallbacks for empty/null

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
| `PurchaseStatus` | Pending (1), InProgressed (2), Received (3), Cancelled (4) |
| `PaymentType` | Cash (1), Credit (2) |
| `PaymentDirection` | Received (1), Paid (2), Adjustment (3) |
| `TransType` | Debit (1), Credit (2) |
| `TransMode` | Cash (1), Bank (2), Credit (3) |
| `TransCategory` | Sales (1), Purchases (2), Office Expenses (3), Home Expenses (4), Cash In (5), Cash Out (6), Bank In (7), Bank Out (8) |
| `ExpenseType` | Office Expenses (1), Home Expenses (2) |
| `MovementType` | In (1), Out (2), Adjustment (3) |
| `MovementSource` | Purchase (1), Sale (2), Manual (3) |
| `InvoiceStatus` | Draft (1), Issued (2), Paid (3), Cancelled (4) |

---

## Domain Model

### Entities

All entities live in `Entities/` and are mapped in `ApplicationDbContext` — read the source for fields/FKs. Lookup tables (UserRole, ClientType, OrderStatus, PurchaseStatus, PaymentType, PaymentDirection, TransType, TransMode, TransCategory, ExpenseType, MovementType, MovementSource, InvoiceStatus) are seeded on startup via `SeedData` — do not re-seed manually.

### Key Business Rules

- **Stock movement source drives direction — never set MovementType manually for Purchase/Sale:**
  - `MovementSource = 1 (Purchase)` → `MovementType` is auto-set to `1 (In)`, stock increases, weighted avg cost recalculated
  - `MovementSource = 2 (Sale)` → `MovementType` is auto-set to `2 (Out)`, stock decreases, weighted avg price recalculated
  - `MovementSource = 3 (Manual)` → caller must supply `MovementType`: `1 (In)`, `2 (Out)`, or `3 (Adjustment)`
  - `MovementType = 3 (Adjustment)` records the event but makes no automatic qty or average change
  - `CreateStockMovementsDto.MovementType` is `int?` — null is valid for Purchase and Sale sources
- **Average dimension follows the document type, not the stock direction:** `StockMovementsService.CreateAsync` recalculates either the weighted-average **Cost** (touches `AverageCost`, `TotalQuantityPurchased`, `CostChangeCount`) or **Price** (touches `AveragePrice`, `TotalQuantitySold`, `PriceChangeCount`). By default the dimension is derived from `MovementType` (In→Cost, Out→Price). `CreateStockMovementsDto.AverageDimensionOverride` (`StockAverageDimension.Cost` / `StockAverageDimension.Price`) overrides this — **required for cancellation reversals** where stock direction and document type disagree (see below).
- **Weighted average cost:** Handled inside `StockMovementsService.CreateAsync` for Cost-dimension movements: `AverageCost = (oldAvgCost * oldQty + signedQty * unitCost) / newQty`. The sign is `+` for stock-in, `−` for stock-out, so purchase receipts raise it and purchase cancellations unwind it.
- **Weighted average price:** Handled inside `StockMovementsService.CreateAsync` for Price-dimension movements: `AveragePrice = (totalSoldBefore * prevAvgPrice + signedQty * unitPrice) / totalSoldNow`. The sign is `+` for sales, `−` for order cancellations.
- **Calling StockMovementsService from other services (Orders, Purchases):** Inject `IStockMovementsService` and call `CreateAsync` with the correct `MovementSource`. Do NOT duplicate the quantity/average logic — it all lives in `StockMovementsService.CreateAsync`.
  ```csharp
  // From PurchaseService — MovementType omitted, auto-derived to In, dimension auto→Cost
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 1,
      Qty = line.Qty, UnitCost = line.UnitCost, MovementDate = purchaseDate
  }, userId);

  // From OrderService — MovementType omitted, auto-derived to Out, dimension auto→Price
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 2,
      Qty = line.Qty, UnitPrice = line.UnitPrice, MovementDate = orderDate
  }, userId);

  // Purchase cancel reversal — stock OUT but must unwind Cost, so override the dimension
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 3, MovementType = 2,
      Qty = line.Qty, UnitCost = line.UnitCost,
      AverageDimensionOverride = StockAverageDimension.Cost,
      MovementDate = DateOnly.FromDateTime(DateTime.UtcNow)
  }, userId);

  // Order cancel reversal — stock IN but must unwind Price, so override the dimension
  await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
      ProductId = line.ProductId, MovementSource = 3, MovementType = 1,
      Qty = line.Qty, UnitPrice = line.UnitPrice,
      AverageDimensionOverride = StockAverageDimension.Price,
      MovementDate = DateOnly.FromDateTime(DateTime.UtcNow)
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
  - **Payment Received (customer pays):** `TransCategoryId=5 (Cash In)`, `TransTypeId=2 (Credit)`, `Amount=+amount`, `ClientId=PartyClientId`. `OrderId`/`PurchaseId` set only when payment has exactly one allocation; null when split across multiple.
  - **Payment Paid (supplier payment):** `TransCategoryId=6 (Cash Out)`, `TransTypeId=1 (Debit)`, `Amount=+amount`, `ClientId=PartyClientId`. Same `OrderId`/`PurchaseId` rule.
  - **Payment Reversed:** reversing Transaction posted with opposite TransType, same `ClientId`/`OrderId`/`PurchaseId` rules; original payment `IsReversed=true`
  - **Expense created:** `TransCategoryId=3 (Office) or 4 (Home)`, `TransTypeId=1 (Debit)`, `Amount=+amount`, `ClientId=null`. TransCategoryId auto-derived from ExpenseTypeId (seeded map: 1→3, 2→4) or supplied explicitly for custom types.
  - **Expense deleted:** Expense removed first (drops FK), then linked Transaction deleted. Never delete Transaction first — cascade would double-delete the Expense.
- **v_client_balance redesign:** View now joins `transactions` (order/purchase totals) against `payments` table directly (excluding `is_reversed=1`). Customers: `order_total - received_payments`. Suppliers: `purchase_total - paid_payments`.
- **PaymentAllocation:** join table linking Payment → Order/Purchase with `AllocatedAmount`. FIFO auto-allocation sorts **Delivered** orders/purchases by date ASC and fills greedily when `Allocations` list is empty on create. Empty/null allocation items in the request are stripped before the FIFO check — sending `[{}]` is treated the same as `[]`.
- **Advance payment handling:** If a customer/supplier pays before delivery, the payment sits as unallocated credit. When `OrderService` or `PurchaseService` transitions a document to Delivered, `IPaymentService.ApplyUnallocatedCreditAsync` is called automatically to apply any existing unallocated credit against the newly delivered document (oldest payment first).
- **FIFO eligibility:** Only `StatusId = 3 (Delivered)` orders/purchases are eligible for allocation. Pending and InProgress documents are excluded — you cannot collect payment for undelivered goods.
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

## Existing Services & Controllers

Service interfaces (`IXxxService`) and their methods live in `Services/`; controllers and their endpoints live in `Controllers/`. Read the source for exact signatures — every new service/controller must follow the Layer Conventions below. `DashboardController` (GET /summary, GET /monthly-overview) and `DeviceController` (not yet created) are the only gaps.

---

## Frontend

See `frontend/CLAUDE.md` for the authoritative frontend architecture, form rules, and coding rules. Progress tracker: `todo/12-frontend.md`. Design reference: `frontend/textile-erp/project/design_handoff_hamzatex_erp/` (v3 prototype — visual source of truth).

---

## Backend Progress

All backend todos are complete except push notifications (`todo/11-push-notifications.md`) and the DeviceController. See `todo/` for per-area detail. The app is fully online-only — the old SQLite sync architecture was removed (migration `RemoveOfflineSyncColumns`).

---

## Configuration

- DB connection string, JWT settings, SMTP config: `backend/HamzaTex.Api/appsettings.json`
- Frontend API base URL: `frontend/app.config.js` → `extra.apiUrl` (env var `API_URL`, defaults to `http://localhost:5000/api`); consumed via `axiosInstance.ts`
- CORS is `AllowAll` — restrict for production in `Program.cs`
- `App:PublicBaseUrl` is used in email confirmation links

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
