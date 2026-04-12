# Orders API

**Epic:** 5 — Staff can create and manage orders
**Status:** 🔴 Not Started

**Architecture / planning pack:** [planning/backend/orders-sprint/](../planning/backend/orders-sprint/01-business-context-textile.md) (read `01`–`05`). Covers textile business context, DB impact, **reporting views**, **ledger posting** (`transactions`), and service/API outline—including **posting on Delivered** and **`Sale` vs `Sales` view alignment**.

**Cross-cutting (sales vs purchases, DB blast radius, business fit, backlog highlights):** [planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md](../planning/backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md).

**Kickoff (validated gaps, two UI screens, coding sequence):** [planning/backend/orders-sprint/07-implementation-kickoff.md](../planning/backend/orders-sprint/07-implementation-kickoff.md).

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

### Ledger (`transactions`) — required for P&L / client balance

Per [planning/backend/orders-sprint/04-ledger-posting-rules.md](../planning/backend/orders-sprint/04-ledger-posting-rules.md):

- [ ] On transition to **Delivered** (or equivalent single moment per planning), insert `Transaction` row(s) with correct `TransCategoryId` (Sales), `TransTypeId` / signed `Amount` convention, `TransModeId` from `PaymentType`, `ClientId`, `UserId`, `TransDate` (align with posting policy).
- [ ] Implement **idempotent** posting (no duplicate transactions if status update is retried).
- [ ] On **Cancelled** after Delivered, post **reversing** ledger entries (and stock reversal—see below); document whether delete is allowed when postings exist.

### Reporting views alignment

- [ ] Fix **`v_monthly_profit_loss`** vs seeded category name **`Sales`** vs view filter **`Sale`** (choose one approach: update view SQL, rename seed, or filter by `trans_category_id`). See [planning/backend/orders-sprint/03-reporting-and-views-alignment.md](../planning/backend/orders-sprint/03-reporting-and-views-alignment.md).
- [ ] Re-verify **`v_client_balance`** after defining `Amount` sign convention for sales.

### Optional schema (traceability)

- [ ] Add nullable `order_id` on `transactions` and/or `stock_movements` (migration) for audit and reversal—recommended follow-up.

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
