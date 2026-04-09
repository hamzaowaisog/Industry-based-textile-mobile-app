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

- `SupplierId` is a `Client.Id` where `ClientTypeId = 2` (Supplier) — validate this
- On `CreateAsync` for each purchase line:
  1. Add a `StockMovement` (MovementType=In, MovementSource=Purchase, UnitCost, Qty)
  2. Recalculate `Product.AverageCost` using weighted average: `(oldAvgCost * oldQty + newUnitCost * newQty) / (oldQty + newQty)`
  3. Update `Product.TotalQuantityPurchased += newQty`
  4. Update `Product.Quantity += newQty`
  5. Increment `Product.CostChangeCount`
- This logic should be coordinated with `IProductService.UpdateByIdAsync` or a dedicated method
