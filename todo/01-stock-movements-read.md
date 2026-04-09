# Stock Movements — Read/Update/Delete Endpoints

**Status:** ✅ Complete

## What Already Exists

- `StockMovement` entity with full fields (`ProductId`, `MovementTypeId`, `MovementSourceId`, `Qty`, `UnitCost`, `UnitPrice`, `AverageCostAtMovement`, `AveragePriceAtMovement`, `MovementDate`)
- `IStockMovementsService` interface — only `CreateAsync` method
- `StockMovementsService` — only `CreateAsync` implemented
- `StockMovementsDto`, `CreateStockMovementsDto`, `UpdateStockMovementsDto` — all in `Models/StockMovementsDto.cs`
- `StockMovementsViewModel`, `StockMovementsCreateViewModel`, `StockMovementsUpdateViewModel` — all in `Services/ViewModel/StockMovementsViewModel.cs`
- `StockMovementsCreateViewModelValidation` and `StockMovementsUpdateViewModelValidation` — both in `Validation/StockMovementsValidation.cs`
- Seeded lookups: `MovementType` (In/Out/Adjustment), `MovementSource` (Purchase/Sale/Manual)

## Tasks

### Service Layer (`Services/StockMovemetsService.cs`)

- [x] Add `GetByIdAsync(int id)` to `IStockMovementsService` and implement
- [x] Add `GetAllAsync(int userId)` to `IStockMovementsService` and implement
- [x] Add `GetAllPaginatedAsync(int page, int pageSize, int userId)` to `IStockMovementsService` and implement
- [x] Add `GetFilteredAsync(productId, movementTypeId, movementSourceId, dateFrom, dateTo, userId)` to `IStockMovementsService` and implement
- [x] Add `UpdateByIdAsync(int id, UpdateStockMovementsDto model, int userId)` to `IStockMovementsService` and implement
- [x] Add `DeleteByIdAsync(int id, int userId)` to `IStockMovementsService` and implement

### PDF Config (`Models/PdfConfig.cs` → `EntityPdfConfigs`)

- [x] Add `StockMovement` config to `EntityPdfConfigs` (columns: ProductName, MovementType, MovementSource, Qty, UnitCost, UnitPrice, AverageCostAtMovement, AveragePriceAtMovement, MovementDate)

### Controller (`Controllers/StockMovementsController.cs`)

- [x] `GET /api/StockMovements` — all movements paginated (Authenticated)
- [x] `GET /api/StockMovements/{id}` — get by ID (Authenticated)
- [x] `GET /api/StockMovements/filtered` — filter by productId, movementTypeId, movementSourceId, dateFrom, dateTo (Authenticated)
- [x] `PUT /api/StockMovements/{id}` — update movement (AdminOrStaff)
- [x] `DELETE /api/StockMovements/{id}` — delete movement (AdminOnly)
- [x] `GET /api/StockMovements/pdf` — PDF export using `IPdfService` + `EntityPdfConfigs.StockMovement`

## Implementation Notes (final state)

### Source → Type derivation (critical for Orders/Purchases)
`MovementSource` drives `MovementType` automatically — never pass both for Purchase/Sale:
- `MovementSource=1 (Purchase)` → `MovementType` auto-set to `1 (In)`, increases qty, recalculates `AverageCost`
- `MovementSource=2 (Sale)` → `MovementType` auto-set to `2 (Out)`, decreases qty, recalculates `AveragePrice`
- `MovementSource=3 (Manual)` → `MovementType` required from caller (1=In, 2=Out, 3=Adjustment)
- `MovementType=3 (Adjustment)` = record only, no qty change

### DTO shape
- `CreateStockMovementsDto.MovementType` is `int?` (nullable) — null is valid for Purchase/Sale
- `UpdateStockMovementsDto.MovementType` is `int?` (nullable) — same rule

### Names in response
After `CreateAsync` and `UpdateByIdAsync`, the saved entity is reloaded with `Include()` so `ProductName`, `MovementTypeName`, `MovementSourceName` are always populated (never null) in responses.

### Update semantics
`UpdateByIdAsync` corrects the movement record fields only — product qty/averages are NOT recascaded. To correct stock levels use a new Manual movement.
