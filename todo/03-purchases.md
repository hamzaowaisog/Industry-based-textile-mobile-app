# Purchases API

**Epic:** 5 (procurement/buying side)
**Status:** 🔴 Not Started

**Planning pack:** [planning/backend/purchases-sprint/01-business-context-procurement.md](../planning/backend/purchases-sprint/01-business-context-procurement.md) (read `01`–`09`). **Purchase workflow + `Transaction.PurchaseId`:** [09-purchase-status-workflow.md](../planning/backend/purchases-sprint/09-purchase-status-workflow.md). **Seed + greenfield deploy:** [08-seed-correction-and-greenfield-deployment.md](../planning/backend/purchases-sprint/08-seed-correction-and-greenfield-deployment.md). **Kickoff:** [07-implementation-kickoff.md](../planning/backend/purchases-sprint/07-implementation-kickoff.md). **Cross-cutting:** [06](../planning/backend/purchases-sprint/06-cross-cutting-risks-and-business-fit.md), [orders 06](../planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md).

## What Already Exists

- `Purchase` entity: `SupplierId` (FK → `Client`), `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt` — **`StatusId` + `PurchaseStatus` to be added** per [09](../planning/backend/purchases-sprint/09-purchase-status-workflow.md)
- `PurchaseLine` entity: `PurchaseId`, `ProductId`, `Qty`, `UnitCost`
- `Transaction` entity: **`PurchaseId`** (nullable FK → `Purchase`) for ledger traceability — **set on every purchase-generated row** ([09](../planning/backend/purchases-sprint/09-purchase-status-workflow.md))
- `ApplicationDbContext` has `DbSet<Purchase>`, `DbSet<PurchaseLine>`
- `PaymentType` seeded (Cash/Credit) — shared with Orders
- `Product` has `TotalQuantityPurchased`, `AverageCost`, `CostChangeCount` — updated when purchase stock **In** runs
- No `PurchaseService`, DTOs, validation, or controller yet

### Database / migrations (planning)

- [ ] Add **`PurchaseStatus`** entity + **`purchase_statuses`** table + **seed** (ids 1–4, same names as `OrderStatus`)
- [ ] Add **`purchases.status_id`** FK → `purchase_statuses`
- [ ] Confirm migration for **`transactions.purchase_id`** FK (entity may already exist — ensure DB matches)
- [ ] **`SeedData` + `v_monthly_profit_loss`:** canonical category ids/names for greenfield deploy ([08](../planning/backend/purchases-sprint/08-seed-correction-and-greenfield-deployment.md))
- [ ] **`ILookupService` / Meta:** `PurchaseStatuses` (mirror `OrderStatuses`)

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `PurchaseDto.cs`:
  - `PurchaseDto` — (Id, SupplierId, **StatusId**, PaymentTypeId, PurchaseDate, Notes, CreatedAt, PurchaseLines)
  - `CreatePurchaseDto` — (SupplierId, PaymentTypeId, PurchaseDate, Notes, Lines — default status **Pending** in service if omitted)
  - `UpdatePurchaseDto` — (**StatusId**, PaymentTypeId, Notes, PurchaseDate)
  - `CreatePurchaseLineDto` — (ProductId, Qty, UnitCost)
  - `PurchaseLineDto` — (Id, PurchaseId, ProductId, Qty, UnitCost)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `PurchaseViewModel.cs`:
  - `PurchaseCreateViewModel`
  - `PurchaseUpdateViewModel`
  - `PurchaseLineCreateViewModel`

### Validation (`Validation/`)

- [ ] Create `PurchaseValidation.cs`:
  - `PurchaseCreateViewModelValidation` — SupplierId required > 0, PurchaseDate required, at least 1 line
  - Each line: ProductId > 0, Qty > 0, UnitCost > 0

### Service Layer (`Services/`)

- [ ] Create `IPurchaseService` interface with:
  - `Task<Response<PurchaseDto>> CreateAsync(CreatePurchaseDto model)`
  - `Task<Response<PurchaseDto>> GetByIdAsync(int id)`
  - `Task<Response<List<PurchaseDto>>> GetAllAsync()`
  - `Task<Response<PagedList<PurchaseDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<PurchaseDto>> UpdateByIdAsync(int id, UpdatePurchaseDto model)`
  - `Task<Response> DeleteByIdAsync(int id)`
- [ ] Create `PurchaseService` implementing `IPurchaseService`
- [ ] Register as Scoped in `Program.cs`

### Ledger (`transactions`) — P&L / supplier balance

Per [planning/backend/purchases-sprint/04-ledger-posting-rules.md](../planning/backend/purchases-sprint/04-ledger-posting-rules.md):

- [ ] On transition to **`StatusId = Delivered` (3)**, insert `Transaction` row(s) with **`PurchaseId`** set, `TransCategoryId` **Purchases (2)**, supplier `ClientId`, **`Amount`** / `TransTypeId` / `TransModeId` aligned with [orders ledger convention](../planning/backend/orders-sprint/04-ledger-posting-rules.md).
- [ ] **Idempotent** posting (check existing `transactions` for this **`PurchaseId`**); same DB transaction as status update + stock movements.

### Reporting views alignment

- [ ] Align **`v_monthly_profit_loss`** purchase bucket: view uses **`Purchase`** vs seed **`Purchases`** — fix with same approach as sales ([planning/backend/purchases-sprint/03-reporting-and-views-alignment.md](../planning/backend/purchases-sprint/03-reporting-and-views-alignment.md)).
- [ ] Verify **`v_client_balance`** for suppliers after posting convention is set.

### Optional

- [ ] `GET /api/Purchase/me` — staff-scoped list (parity with Orders); or enforce scope only in `filtered`.
- [ ] Migration: nullable **`purchase_id`** on **`stock_movements`** (transactions already have FK).

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Purchase` config to `EntityPdfConfigs` (columns: Id, SupplierId, **StatusId**, PaymentTypeId, PurchaseDate, Notes, CreatedAt)

### Controller (`Controllers/PurchaseController.cs`)

- [ ] `POST /api/Purchase` — create purchase + lines, **Pending** (AdminOrStaff)
- [ ] `GET /api/Purchase` — all purchases paginated (AdminOnly)
- [ ] `GET /api/Purchase/{id}` — get by ID with lines (Authenticated)
- [ ] `GET /api/Purchase/filtered` — filter by supplierId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Purchase/{id}` — update header + **status** (Delivered triggers stock + ledger) (AdminOrStaff)
- [ ] `DELETE /api/Purchase/{id}` — delete (AdminOnly)
- [ ] `GET /api/Purchase/pdf` — PDF export (AdminOrStaff)

## Business Logic Notes

### Lifecycle (same routine as orders)

Per [09-purchase-status-workflow.md](../planning/backend/purchases-sprint/09-purchase-status-workflow.md): **Pending** → optional **InProgressed** → **Delivered** (post stock + ledger) or **Cancelled**. **No** stock/ledger on create.

### Stock movements (CRITICAL — read before implementing)
`PurchaseService` must inject `IStockMovementsService` and call `CreateAsync` per purchase line **when moving to Delivered**. Do NOT reimplement quantity or weighted average logic — it all lives in `StockMovementsService.CreateAsync`. The service automatically:
- Sets `MovementType = In (1)` (auto-derived from `MovementSource = Purchase`)
- Increases `Product.Quantity`
- Recalculates `Product.AverageCost` using weighted average
- Updates `Product.TotalQuantityPurchased` and `CostChangeCount`

```csharp
// For each purchase line — MovementType is omitted; auto-derived to In (1) by the service
var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
    ProductId      = line.ProductId,
    MovementSource = 1,           // Purchase — auto-sets MovementType to In
    Qty            = line.Qty,
    UnitCost       = line.UnitCost,
    MovementDate   = DateOnly.FromDateTime(model.PurchaseDate)
}, userId);

if (!movResult.Success)
{
    await transaction.RollbackAsync();
    return Response<PurchaseDto>.ErrorResponse(movResult.Message);
}
```

### Ledger posting

After stock movements on **Delivered**, insert `Transaction` rows with **`PurchaseId`** per [planning/backend/purchases-sprint/04-ledger-posting-rules.md](../planning/backend/purchases-sprint/04-ledger-posting-rules.md). Wrap **status update to Delivered + movements + transactions** in one database transaction.

### Delete policy

Deleting a purchase that reached **Delivered** can desync stock and GL — define **reject delete** vs **reversal** in `DeleteByIdAsync` per planning `04`.

### Other rules
- `SupplierId` must reference a `Client.Id` where `ClientTypeId = 2 (Supplier)` — validate in `PurchaseService`
- **Delivered transition:** single DB transaction for status + stock + ledger
