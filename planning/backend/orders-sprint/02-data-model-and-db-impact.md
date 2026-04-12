# Orders — data model and database impact

This document describes how **orders** sit in the MySQL schema and what they touch when implemented. Entity paths refer to [`backend/HamzaTex.Api`](../../../backend/HamzaTex.Api).

## Core tables (already migrated)

### `orders`

Mapped by [`Order`](../../../backend/HamzaTex.Api/Entities/Order.cs).

| Column | Notes |
|--------|--------|
| `id` | PK |
| `client_id` | FK → `clients`; nullable in model—**API should require** a customer for business creates |
| `status_id` | FK → `order_statuses` (seeded Pending … Cancelled) |
| `payment_type_id` | FK → `payment_types` (Cash / Credit; shared with purchases) |
| `order_date` | `DATE` — operational date for the order |
| `notes` | Optional |
| `created_at` | Audit |

Indexes (examples): `client_id`, `order_date`, composites `(client_id, order_date)`, `(status_id, order_date)`.

**No `user_id` on `orders`.** Scoping for staff is via **`clients.user_id`**: filter orders by joining `clients` where `clients.user_id = currentUserId` unless the caller is admin.

### `order_lines`

Mapped by [`OrderLine`](../../../backend/HamzaTex.Api/Entities/OrderLine.cs).

| Column | Notes |
|--------|--------|
| `order_id` | FK → `orders` (cascade delete) |
| `product_id` | FK → `products` |
| `qty` | Integer quantity sold |
| `unit_price` | Selling price per unit |

Line total for business logic: `Qty * UnitPrice` (use appropriate decimal handling in C#).

## Related entities

### Clients

[`Client`](../../../backend/HamzaTex.Api/Entities/Client.cs) must be **Customer** (`ClientTypeId = 1`) for sales orders. Suppliers (`ClientTypeId = 2`) are for purchases, not orders.

### Products

[`Product`](../../../backend/HamzaTex.Api/Entities/Product.cs) holds on-hand quantity and averages updated by stock movements—not by updating `OrderLine` directly.

### Stock movements

[`StockMovement`](../../../backend/HamzaTex.Api/Entities/StockMovement.cs) records each inventory movement. For sales, the service uses **`MovementSource = Sale`** so **`MovementType` becomes Out** automatically.

**Gap today:** there is **no `order_id`** (or `order_line_id`) on `stock_movements`. Traceability from a movement back to a specific order is indirect (product, date, user). Optional future migration:

- Add nullable `order_id` and/or `order_line_id` on `stock_movements`, or
- Add a link table — improves support and audits.

### Transactions (ledger)

[`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) is the table **reporting views aggregate**. Orders do not automatically appear in P&L or client balance until rows are inserted here per [04-ledger-posting-rules.md](./04-ledger-posting-rules.md).

Optional future: **`order_id`** on `transactions` (nullable FK) for traceability and reversal.

## Database transaction boundaries (application-level)

Create/update flows that touch **order + lines + stock movements + transactions** should run inside a **single EF Core database transaction** so partial failure never leaves inconsistent stock vs ledger.

## Migrations for this sprint

- **Minimum:** none if only application logic and existing columns are used.
- **Recommended (later):** FK from `stock_movements` and/or `transactions` to `orders` for audit and idempotent reversal.
