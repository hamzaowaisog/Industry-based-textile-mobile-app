# Orders API

**Epic:** 5 — Staff can create and manage orders
**Status:** 🔴 Not Started

## What Already Exists

- `Order` entity: `ClientId`, `StatusId`, `PaymentTypeId`, `OrderDate`, `Notes`, `CreatedAt`
- `OrderLine` entity: `OrderId`, `ProductId`, `Qty`, `UnitPrice`
- `OrderStatus` entity — seeded with: Pending (1), InProgressed (2), Delivered (3), Cancelled (4)
- `PaymentType` entity — seeded with: Cash (1), Credit (2) — shared with Purchase
- `ApplicationDbContext` has `DbSet<Order>`, `DbSet<OrderLine>`, `DbSet<OrderStatus>`
- No service, no DTO, no ViewModel, no validation, no controller

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `OrderDto.cs`:
  - `OrderDto` — response shape (Id, ClientId, StatusId, PaymentTypeId, OrderDate, Notes, CreatedAt, OrderLines)
  - `CreateOrderDto` — (ClientId, StatusId, PaymentTypeId, OrderDate, Notes, Lines: List of CreateOrderLineDto)
  - `UpdateOrderDto` — (StatusId, PaymentTypeId, Notes, OrderDate)
  - `CreateOrderLineDto` — (ProductId, Qty, UnitPrice)
  - `OrderLineDto` — (Id, OrderId, ProductId, Qty, UnitPrice)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `OrderViewModel.cs`:
  - `OrderCreateViewModel` — input from controller
  - `OrderUpdateViewModel`
  - `OrderLineCreateViewModel`

### Validation (`Validation/`)

- [ ] Create `OrderValidation.cs`:
  - `OrderCreateViewModelValidation` — ClientId required > 0, OrderDate required, at least 1 line
  - `OrderUpdateViewModelValidation` — StatusId required > 0

### Service Layer (`Services/`)

- [ ] Create `IOrderService` interface with:
  - `Task<Response<OrderDto>> CreateAsync(CreateOrderDto model)`
  - `Task<Response<OrderDto>> GetByIdAsync(int id)`
  - `Task<Response<List<OrderDto>>> GetAllAsync()`
  - `Task<Response<List<OrderDto>>> GetAllByUserIdAsync(int userId)`
  - `Task<Response<PagedList<OrderDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<OrderDto>> UpdateByIdAsync(int id, UpdateOrderDto model)`
  - `Task<Response> DeleteByIdAsync(int id)`
- [ ] Create `OrderService` implementing `IOrderService`
- [ ] Register `IOrderService` / `OrderService` as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Order` config to `EntityPdfConfigs` (columns: Id, ClientId, StatusId, PaymentTypeId, OrderDate, Notes, CreatedAt)

### Controller (`Controllers/OrderController.cs`)

- [ ] `POST /api/Order` — create order + lines (AdminOrStaff)
- [ ] `GET /api/Order` — all orders paginated (AdminOnly)
- [ ] `GET /api/Order/me` — orders for logged-in user (Authenticated)
- [ ] `GET /api/Order/{id}` — get by ID with lines (Authenticated)
- [ ] `GET /api/Order/filtered` — filter by clientId, statusId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Order/{id}` — update order header (AdminOrStaff)
- [ ] `DELETE /api/Order/{id}` — delete order + lines (AdminOnly)
- [ ] `GET /api/Order/pdf` — PDF list export (AdminOrStaff)

## Business Logic Notes

### Stock movements (CRITICAL — read before implementing)
`OrderService` must inject `IStockMovementsService` and call `CreateAsync` per order line. Do NOT reimplement quantity or average logic — it all lives in `StockMovementsService.CreateAsync`.

```csharp
// For each order line — MovementType is omitted; auto-derived to Out (2) by the service
var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
    ProductId      = line.ProductId,
    MovementSource = 2,           // Sale — auto-sets MovementType to Out
    Qty            = line.Qty,
    UnitPrice      = line.UnitPrice,
    MovementDate   = DateOnly.FromDateTime(model.OrderDate)
}, userId);

if (!movResult.Success)
{
    // Insufficient stock — roll back entire order transaction
    await transaction.RollbackAsync();
    return Response<OrderDto>.ErrorResponse(movResult.Message);
}
```

### Cancellation reversal
When `StatusId` is updated to `4 (Cancelled)`, reverse each line's stock movement using Manual In:
```csharp
await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
    ProductId      = line.ProductId,
    MovementSource = 3,   // Manual
    MovementType   = 1,   // In — puts stock back
    Qty            = line.Qty,
    MovementDate   = DateOnly.FromDateTime(DateTime.UtcNow)
}, userId);
```

### Other rules
- `Client.ClientTypeId` must be `1 (Customer)` for orders — validate in `OrderService.CreateAsync`
- `PaymentType` is a shared lookup (Cash/Credit) used by both Orders and Purchases
- Wrap the entire order create (header + lines + stock movements) in a single DB transaction
