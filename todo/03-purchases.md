# Purchases API

**Epic:** 5 (procurement/buying side)
**Status:** ✅ Complete

**Planning pack:** [planning/backend/purchases-sprint/01-business-context-procurement.md](../planning/backend/purchases-sprint/01-business-context-procurement.md) (read `01`–`09`). **Purchase workflow + `Transaction.PurchaseId`:** [09-purchase-status-workflow.md](../planning/backend/purchases-sprint/09-purchase-status-workflow.md). **Seed + greenfield deploy:** [08-seed-correction-and-greenfield-deployment.md](../planning/backend/purchases-sprint/08-seed-correction-and-greenfield-deployment.md). **Kickoff:** [07-implementation-kickoff.md](../planning/backend/purchases-sprint/07-implementation-kickoff.md). **Cross-cutting:** [06](../planning/backend/purchases-sprint/06-cross-cutting-risks-and-business-fit.md), [orders 06](../planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md).

---

## What Was Built

### Database / Migrations
- [x] Added **`PurchaseStatus`** entity + **`purchase_statuses`** table (migration `AddPurchaseStatusAndStatusId`)
- [x] Added **`purchases.status_id`** FK → `purchase_statuses`
- [x] **`transactions.purchase_id`** FK confirmed and navigation wired in `ApplicationDbContext`
- [x] **`transactions.order_id`** navigation also wired (was missing)
- [x] **`Order.Transactions`** collection added to entity
- [x] **`Purchase.Transactions`** collection added to entity
- [x] `purchase_statuses` seeded (Pending/InProgressed/Delivered/Cancelled, ids 1–4)
- [x] `order_lines.qty` and `purchase_lines.qty` changed to `decimal(14,2)` (migration `ChangeQtyToDecimalOnOrderAndPurchaseLines`)
- [x] `order_lines.unit_price` and `purchase_lines.unit_cost` changed to `decimal(14,4)` to match `stock_movements` precision (migration `ChangeUnitCostAndPriceToDecimal14x4OnLines`)

### Models / DTOs (`Models/PurchaseDto.cs`)
- [x] `PurchaseDto` — Id, SupplierId, SupplierName, StatusId, StatusName, PaymentTypeId, PaymentTypeName, PurchaseDate, Notes, CreatedAt, Total, PurchaseLines
- [x] `PurchaseLineDto` — Id, PurchaseId, ProductId, ProductName, Qty (decimal), UnitCost (decimal)
- [x] `CreatePurchaseDto` + `CreatePurchaseLineDto`
- [x] `UpdatePurchaseDto`

### ViewModels (`Services/ViewModel/PurchaseViewModel.cs`)
- [x] `PurchaseCreateViewModel`, `PurchaseLineCreateViewModel`, `PurchaseUpdateViewModel`

### Validation (`Validation/PurchaseValidation.cs`)
- [x] `PurchaseCreateViewModelValidation` — SupplierId > 0, PurchaseDate required, at least 1 line, each line: ProductId > 0, Qty > 0, UnitCost > 0
- [x] `PurchaseUpdateViewModelValidation` — StatusId > 0, PaymentTypeId > 0, PurchaseDate required

### Service Layer (`Services/PurchaseService.cs`)
- [x] `IPurchaseService` interface with XML doc comments
- [x] `CreateAsync` — validates supplier is `ClientTypeId=2`, validates all ProductIds exist (single query), defaults to Pending
- [x] `GetByIdAsync` — scoped (staff see own supplier's purchases only)
- [x] `GetAllAsync` — admin only
- [x] `GetAllByUserIdAsync` — scoped via `Supplier.UserId`
- [x] `GetAllPaginatedAsync`
- [x] `GetFilteredAsync` — supplierId, statusId, dateFrom, dateTo; scoped for staff
- [x] `UpdateByIdAsync` — full status lifecycle with idempotency guard
- [x] `DeleteByIdAsync` — rejects delete if Delivered
- [x] Registered as Scoped in `Program.cs`

### Ledger — confirmed correct conventions
- [x] **Delivered** → `TransCategoryId=2 (Purchases)`, `TransTypeId=1 (Debit)`, `Amount=+total`, `PurchaseId` set
- [x] **Cancelled reversal** → `TransCategoryId=2`, `TransTypeId=2 (Credit)`, `Amount=-total`, `PurchaseId` set
- [x] Idempotent guard: checks existing transactions for `PurchaseId` before posting
- [x] Entire Delivered transition (status + stock In + ledger) in one DB transaction

### Stock Movements on Delivered
- [x] Per line: `StockMovementsService.CreateAsync(MovementSource=1 Purchase, MovementType=null auto-derived to In)`
- [x] Rollback on any stock movement failure

### Cancellation reversal
- [x] If previously Delivered: per line Manual Out (`MovementSource=3, MovementType=2`) to reverse stock + compensating transaction

### PDF Config (`Models/PdfConfig.cs`)
- [x] `EntityPdfConfigs.Purchase` added (Id, SupplierName, StatusName, PaymentTypeName, PurchaseDate, Total, Notes, CreatedAt)

### Controller (`Controllers/PurchaseController.cs`)
- [x] `POST /api/Purchase` — create (AdminOrStaff)
- [x] `GET /api/Purchase` — paginated (AdminOnly)
- [x] `GET /api/Purchase/me` — scoped to user's suppliers (Authenticated)
- [x] `GET /api/Purchase/{id}` — by ID with lines (Authenticated)
- [x] `GET /api/Purchase/filtered` — filter by supplierId, statusId, dateFrom, dateTo (Authenticated)
- [x] `PUT /api/Purchase/{id}` — status transitions + header update (AdminOrStaff)
- [x] `DELETE /api/Purchase/{id}` — hard delete, blocked if Delivered (AdminOnly)
- [x] `GET /api/Purchase/pdf` — PDF export (AdminOrStaff)

### Meta / Lookup
- [x] `GetPurchaseStatusesAsync()` added to `ILookupService` + `LookupService`
- [x] `PurchaseStatuses` added to `LookupsAllDto`
- [x] `GET /api/Meta/purchasestatuses` and `purchase-statuses` wired in `GetByTypeAsync`
- [x] `GET /api/Meta/all` includes `PurchaseStatuses`

### Reporting Views — all aligned
- [x] `v_monthly_profit_loss` uses `trans_category_id = 2` for purchases bucket (id-based, no name drift)
- [x] `v_client_balance` works correctly — raw amount sum; positive amount on Delivered = supplier balance up
- [x] `v_monthly_credit_debit` fixed — Sales=Credit(2), Purchases=Debit(1) so `balance = Sales - Purchases` is positive for profitable months

### Bug Fixes Applied During Sprint
- [x] `OrderLine.Qty` and `PurchaseLine.Qty` corrected from `int` to `decimal(14,2)`
- [x] `unit_price` / `unit_cost` precision bumped to `(14,4)` to match `stock_movements`
- [x] Product existence validation added to both `PurchaseService.CreateAsync` and `OrderService.CreateAsync` — returns `"Product with ID {x} does not exist."` instead of crashing
- [x] `TransTypeId` corrected in both `OrderService` and `PurchaseService` (was backwards for `v_monthly_credit_debit`)
- [x] `Transaction → Order` and `Transaction → Purchase` navigation properties wired in `ApplicationDbContext.OnModelCreating` (were missing)

---

## Optional / Out of Scope (not implemented)

- [ ] `stock_movements.purchase_id` optional FK — stronger inventory audit trail linking each movement to its source purchase. Low priority; traceability already covered via `transactions.purchase_id`.
- [ ] Line-level ledger posting (one `Transaction` per line with `ProductId`) — currently header-level (one transaction per purchase). Could be added if product-level P&L is needed.

---

## Greenfield Deploy Checklist

1. Empty MySQL DB + connection string in `appsettings.json`
2. `dotnet run` — auto-migrates and seeds all lookup tables including `purchase_statuses`
3. Smoke test: create purchase → set Delivered → verify `v_monthly_profit_loss` shows `total_purchases` for the month
4. Verify `v_client_balance` shows positive balance for supplier after Delivered purchase
5. Verify `v_monthly_credit_debit` shows `total_debit` increase (not credit) for a purchase
