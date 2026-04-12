# Orders API

**Epic:** 5 — Staff can create and manage orders
**Status:** ✅ Complete

**Architecture / planning pack:** [planning/backend/orders-sprint/](../planning/backend/orders-sprint/01-business-context-textile.md) (read `01`–`05`). Covers textile business context, DB impact, **reporting views**, **ledger posting** (`transactions`), and service/API outline—including **posting on Delivered** and **`Sale` vs `Sales` view alignment**.

**Cross-cutting (sales vs purchases, DB blast radius, business fit, backlog highlights):** [planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md](../planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md).

**Kickoff (validated gaps, two UI screens, coding sequence):** [planning/backend/orders-sprint/07-implementation-kickoff.md](../planning/backend/orders-sprint/07-implementation-kickoff.md).

## What Was Built

All layers implemented. Full lifecycle: create → Pending → Delivered (posts stock + ledger in one DB transaction) → Cancelled (reverses stock + compensating ledger entry).

- `Models/OrderDto.cs` — `OrderDto`, `CreateOrderDto`, `UpdateOrderDto`, `CreateOrderLineDto`, `OrderLineDto`
- `Services/ViewModel/OrderViewModel.cs` — `OrderCreateViewModel`, `OrderUpdateViewModel`, `OrderLineCreateViewModel`
- `Validation/OrderValidation.cs` — `OrderCreateViewModelValidation`, `OrderUpdateViewModelValidation`
- `Services/OrderService.cs` — `IOrderService` + `OrderService`; registered Scoped in `Program.cs`
- `Models/PdfConfig.cs` — `Order` config added to `EntityPdfConfigs`
- `Controllers/OrderController.cs` — all 8 endpoints

## Completed Tasks

### Models / DTOs (`Models/`)

- [x] Create `OrderDto.cs` with all shapes (OrderDto, CreateOrderDto, UpdateOrderDto, CreateOrderLineDto, OrderLineDto)

### ViewModels (`Services/ViewModel/`)

- [x] Create `OrderViewModel.cs` (OrderCreateViewModel, OrderUpdateViewModel, OrderLineCreateViewModel)

### Validation (`Validation/`)

- [x] Create `OrderValidation.cs` (create + update validators)

### Service Layer (`Services/`)

- [x] `IOrderService` interface with all methods (CreateAsync, GetByIdAsync, GetAllAsync, GetAllByUserIdAsync, GetAllPaginatedAsync, GetFilteredAsync, UpdateByIdAsync, DeleteByIdAsync)
- [x] `OrderService` implemented with full lifecycle and status transition logic
- [x] Registered as Scoped in `Program.cs`

### Ledger (`transactions`)

- [x] Transition to **Delivered**: inserts `Transaction` row (TransCategory=Sales, TransType=Debit for cash, TransMode from PaymentType, ClientId, UserId, TransDate=OrderDate)
- [x] Idempotent: guard against re-posting if already Delivered
- [x] Transition to **Cancelled** after Delivered: inserts compensating Credit ledger entry + reverses stock (Manual In per line)
- [x] Delete blocked if order is in Delivered state; linked transactions cleaned up on cancel

### Optional schema (traceability)

- [ ] Add nullable `order_id` on `transactions` / `stock_movements` — deferred, recommended follow-up

### PDF Config (`Models/PdfConfig.cs`)

- [x] `Order` config added to `EntityPdfConfigs`

### Controller (`Controllers/OrderController.cs`)

- [x] `POST /api/Order` — create order + lines (AdminOrStaff)
- [x] `GET /api/Order` — all orders paginated (AdminOnly)
- [x] `GET /api/Order/me` — orders for logged-in user (Authenticated)
- [x] `GET /api/Order/{id}` — get by ID with lines (Authenticated)
- [x] `GET /api/Order/filtered` — filter by clientId, statusId, dateFrom, dateTo (Authenticated)
- [x] `PUT /api/Order/{id}` — update order header + status transitions (AdminOrStaff)
- [x] `DELETE /api/Order/{id}` — delete order + lines (AdminOnly, blocked if Delivered)
- [x] `GET /api/Order/pdf` — PDF list export (AdminOrStaff)

## Business Logic Notes

### Lifecycle vs stock and ledger (read planning first)

Target behavior is documented in [planning/backend/orders-sprint/04-ledger-posting-rules.md](../planning/backend/orders-sprint/04-ledger-posting-rules.md): **stock out (Sale)** and **`transactions` posting** should occur together when the order becomes **Delivered**, inside one DB transaction—unless product policy explicitly changes this.

### Stock movements (CRITICAL — read before implementing)
`OrderService` must inject `IStockMovementsService` and call `CreateAsync` per order line **when the business event runs** (default: **Delivered** transition). Do NOT reimplement quantity or average logic — it all lives in `StockMovementsService.CreateAsync`.

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

### Ledger posting

After successful Sale movements (or in the same unit of work), insert `Transaction` rows per [planning/backend/orders-sprint/04-ledger-posting-rules.md](../planning/backend/orders-sprint/04-ledger-posting-rules.md). Wrap **order update + stock + transactions** in a **single** database transaction.

### Cancellation reversal
When `StatusId` is updated to `4 (Cancelled)` **after Delivered**, reverse **ledger** (compensating `Transaction` rows or policy-defined) and reverse each line's stock using Manual In:

```csharp
await _stockMovementsService.CreateAsync(new CreateStockMovementsDto {
    ProductId      = line.ProductId,
    MovementSource = 3,   // Manual
    MovementType   = 1,   // In — puts stock back
    Qty            = line.Qty,
    MovementDate   = DateOnly.FromDateTime(DateTime.UtcNow)
}, userId);
```

If the order **never reached Delivered**, there are typically **no** Sale movements or revenue postings to reverse.

### Other rules
- `Client.ClientTypeId` must be `1 (Customer)` for orders — validate in `OrderService.CreateAsync`
- `PaymentType` is a shared lookup (Cash/Credit) used by both Orders and Purchases
- Wrap the **logical unit of work** (e.g. transition to Delivered: header + lines + stock movements + transactions) in a single DB transaction
