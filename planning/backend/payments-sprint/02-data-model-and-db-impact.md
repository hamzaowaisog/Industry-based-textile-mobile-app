# Payments Sprint — Data Model & DB Impact

## Entities Modified

### `Payment` (extended)

New fields added to existing entity:

| Field | Type | Purpose |
|---|---|---|
| `UserId` | `int?` FK → ApplicationUser | Who recorded the payment |
| `IsReversed` | `bool` | True if this payment has been reversed |
| `ReversedByPaymentId` | `int?` FK → Payment | Points to the reversing payment |
| `OriginalPaymentId` | `int?` FK → Payment | On a reversing payment, points back to original |
| `TransactionId` | `int?` FK → Transaction | The ledger entry this payment created |

### `PaymentAllocation` (new entity)

Join table linking a payment to one or more orders/purchases.

| Field | Type | Purpose |
|---|---|---|
| `Id` | `int` PK | |
| `PaymentId` | `int` FK → Payment | Required |
| `OrderId` | `int?` FK → Order | Null if purchase allocation |
| `PurchaseId` | `int?` FK → Purchase | Null if order allocation |
| `AllocatedAmount` | `decimal(14,4)` | Amount applied to this order/purchase |

**Constraint:** `OrderId` and `PurchaseId` are mutually exclusive per row (enforced in service layer).

## Migrations Applied

| Migration | Change |
|---|---|
| `AddPaymentAllocationTable` | Creates `payment_allocations` table with FKs to payments, orders, purchases |
| `AddFieldsToPayment` | Adds `user_id`, `is_reversed`, `reversed_by_payment_id`, `original_payment_id`, `transaction_id` to `payments` |
| `UpdateVClientBalanceView` | Drops and recreates `v_client_balance` to read from payments table |

## DB Context Changes

- `DbSet<PaymentAllocation> PaymentAllocations`
- `Payment` → `PaymentAllocation` one-to-many (cascade delete on allocation when payment deleted)
- `Payment` → self-referencing FK for reversal chain (no cascade)
- `Payment` → `ApplicationUser` (restrict delete)
- `Payment` → `Transaction` (no cascade)
- `PaymentAllocation` → `Order` (restrict)
- `PaymentAllocation` → `Purchase` (restrict)

## View Redesign: `v_client_balance`

Previous design read only from `transactions`, which didn't account for payments.

New design — two halves via `UNION ALL`:

**Customers (ClientTypeId = 1):**
```sql
balance = SUM(sales transactions) - SUM(received payments where is_reversed = 0)
```

**Suppliers (ClientTypeId = 2):**
```sql
balance = SUM(purchase transactions) - SUM(paid payments where is_reversed = 0)
```

Positive balance = still owes money. Negative = credit on account.
