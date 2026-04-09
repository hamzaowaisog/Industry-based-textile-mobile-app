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

- When an order is created: optionally create a `StockMovement` (MovementType=Out, MovementSource=Sale) per line
- `Client.ClientTypeId` should be 1 (Customer) for orders — consider validating this
- `PaymentType` is a shared lookup (Cash/Credit) used by both Orders and Purchases
- `StatusId` 4 (Cancelled) should reverse stock movement if stock was already deducted
