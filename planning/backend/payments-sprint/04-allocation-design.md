# Payments Sprint — Allocation Design

## Problem

A single payment can cover multiple orders or purchases. The system needs to track which portion of a payment was applied to which document for reconciliation and outstanding balance calculation.

## Solution: PaymentAllocation Table

A join table `payment_allocations` links each payment to one or more orders/purchases with the specific amount allocated.

## Auto-FIFO Allocation

When `Allocations` is empty on create, the system auto-allocates using FIFO (First In, First Out):

1. Fetch all non-Cancelled orders/purchases for the client ordered by date ASC
2. For each document, calculate `outstanding = total - SUM(existing allocations)`
3. Allocate `MIN(remaining payment, outstanding)` to the document
4. Continue until payment amount is exhausted or all documents are settled
5. Any remaining unallocated amount is tracked as credit (visible via `GET /api/Payment/unallocated/{clientId}`)

### FIFO Example

Customer owes: Order 1 = £20k, Order 2 = £30k, Order 3 = £50k
Customer pays £75k:

| Order | Outstanding | Allocated | Payment Remaining |
|---|---|---|---|
| Order 1 | £20k | £20k | £55k |
| Order 2 | £30k | £30k | £25k |
| Order 3 | £50k | £25k | £0 |

Order 3 still has £25k outstanding. Customer has £0 unallocated credit.

## Manual Allocation

Staff can provide explicit `Allocations` in the request body:

```json
{
  "allocations": [
    { "orderId": 5, "allocatedAmount": 20000 },
    { "orderId": 6, "allocatedAmount": 25000 }
  ]
}
```

Validation rules:
- Each `allocatedAmount` must be > 0
- Each `allocatedAmount` cannot exceed the document's current outstanding balance
- Sum of allocations can be ≤ payment amount (remainder = unallocated credit)

## Unallocated Credit

Any payment amount not assigned to an order/purchase is "unallocated credit".

`GET /api/Payment/unallocated/{clientId}` returns:
```json
{
  "clientId": 3,
  "clientName": "Ahmed Textiles",
  "unallocatedAmount": 80000
}
```

Calculated as: `SUM(non-reversed payments) - SUM(all allocations for that client)`

## Direction ↔ Document Pairing

| Direction | Allocatable Against |
|---|---|
| Received (1) — customer pays | Orders only |
| Paid (2) — we pay supplier | Purchases only |
| Adjustment (3) | Either (no validation enforced) |
