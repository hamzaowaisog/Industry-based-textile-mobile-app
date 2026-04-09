# Stock Movements — Read/Update/Delete Endpoints

**Status:** ⚠️ Partial — `POST /api/StockMovements` (create) done, rest missing

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

- [ ] Add `GetByIdAsync(int id)` to `IStockMovementsService` and implement
- [ ] Add `GetAllAsync(int userId)` to `IStockMovementsService` and implement
- [ ] Add `GetAllPaginatedAsync(int page, int pageSize, int userId)` to `IStockMovementsService` and implement
- [ ] Add `UpdateByIdAsync(int id, UpdateStockMovementsDto model)` to `IStockMovementsService` and implement
- [ ] Add `DeleteByIdAsync(int id)` to `IStockMovementsService` and implement

### PDF Config (`Models/PdfConfig.cs` → `EntityPdfConfigs`)

- [ ] Add `StockMovement` config to `EntityPdfConfigs` (columns: ProductId, MovementType, MovementSource, Qty, UnitCost, UnitPrice, MovementDate)

### Controller (`Controllers/StockMovementsController.cs`)

- [ ] `GET /api/StockMovements` — all movements paginated (Authenticated)
- [ ] `GET /api/StockMovements/{id}` — get by ID (Authenticated)
- [ ] `GET /api/StockMovements/filtered` — filter by productId, movementTypeId, movementSourceId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/StockMovements/{id}` — update movement (AdminOrStaff) — use existing `UpdateStockMovementsDto`
- [ ] `DELETE /api/StockMovements/{id}` — delete movement (AdminOnly)
- [ ] `GET /api/StockMovements/pdf` — PDF export using `IPdfService` + `EntityPdfConfigs.StockMovement`

## Notes

- `UpdateStockMovementsDto` already has all fields — use it directly
- On `PUT`, consider whether to recalculate `AverageCostAtMovement` on the product
- `StockMovementsService.CreateAsync` already handles stock level validation (insufficient stock check) — read methods are straightforward
