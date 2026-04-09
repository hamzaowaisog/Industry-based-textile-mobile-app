# Purchases API

**Epic:** 5 (procurement/buying side)
**Status:** 🔴 Not Started

## What Already Exists

- `Purchase` entity: `SupplierId` (FK → `Client`), `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt`
- `PurchaseLine` entity: `PurchaseId`, `ProductId`, `Qty`, `UnitCost`
- `ApplicationDbContext` has `DbSet<Purchase>`, `DbSet<PurchaseLine>`
- `PaymentType` seeded (Cash/Credit) — shared with Orders
- `Product` has `TotalQuantityPurchased`, `AverageCost`, `CostChangeCount` — these must be updated on purchase
- No service, no DTO, no ViewModel, no validation, no controller

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `PurchaseDto.cs`:
  - `PurchaseDto` — (Id, SupplierId, PaymentTypeId, PurchaseDate, Notes, CreatedAt, PurchaseLines)
  - `CreatePurchaseDto` — (SupplierId, PaymentTypeId, PurchaseDate, Notes, Lines: List of CreatePurchaseLineDto)
  - `UpdatePurchaseDto` — (PaymentTypeId, Notes, PurchaseDate)
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

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Purchase` config to `EntityPdfConfigs` (columns: Id, SupplierId, PaymentTypeId, PurchaseDate, Notes, CreatedAt)

### Controller (`Controllers/PurchaseController.cs`)

- [ ] `POST /api/Purchase` — create purchase + lines (AdminOrStaff)
- [ ] `GET /api/Purchase` — all purchases paginated (AdminOnly)
- [ ] `GET /api/Purchase/{id}` — get by ID with lines (Authenticated)
- [ ] `GET /api/Purchase/filtered` — filter by supplierId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Purchase/{id}` — update purchase header (AdminOrStaff)
- [ ] `DELETE /api/Purchase/{id}` — delete (AdminOnly)
- [ ] `GET /api/Purchase/pdf` — PDF export (AdminOrStaff)

## Business Logic Notes

### Stock movements (CRITICAL — read before implementing)
`PurchaseService` must inject `IStockMovementsService` and call `CreateAsync` per purchase line. Do NOT reimplement quantity or weighted average logic — it all lives in `StockMovementsService.CreateAsync`. The service automatically:
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

### Other rules
- `SupplierId` must reference a `Client.Id` where `ClientTypeId = 2 (Supplier)` — validate in `PurchaseService.CreateAsync`
- Wrap the entire purchase create (header + lines + stock movements) in a single DB transaction
