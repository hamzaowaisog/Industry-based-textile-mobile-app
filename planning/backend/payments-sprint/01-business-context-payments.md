# Payments Sprint — Business Context

## Role-Play Session Summary

Brainstormed from the perspective of CEO, CFO, CTO, and software architect of a textile trading company to surface all edge cases before implementation.

## Business Problem

The company handles two payment flows:

1. **Inbound (Received)** — Customers pay for goods delivered via orders
2. **Outbound (Paid)** — Company pays suppliers for goods received via purchases

Without a payment tracking system:
- No visibility into which orders are paid vs outstanding
- No way to track supplier balances
- Manual reconciliation errors when customers overpay or pay the wrong client
- No audit trail for payment reversals

## Key Business Scenarios Identified

### Multi-Order Payment (FIFO)
A customer with 3 outstanding orders (£20k, £30k, £50k) sends a single payment of £45k.
The system must automatically allocate £20k to order 1, £25k to order 2, and carry nothing over or prompt for manual allocation for the remainder.

### Over-Payment / Unallocated Credit
Customer pays £120k but only £40k outstanding on their current order.
Remaining £80k must be tracked as unallocated credit and applied to future orders.

### Wrong-Client Payment
Staff records a payment of £50k against Client A but it actually belongs to Client B.
Requires an atomic reverse-and-correct operation — not a delete, because the original payment must remain in the audit trail.

### Wrong-Amount Reversal
A payment was entered with the wrong amount.
Requires a clean reversal that posts a mirror transaction and flags the original as reversed.

### Supplier Payments
Outbound payments to suppliers reduce what the company owes on purchase orders.
Same FIFO allocation logic applies but against purchase records instead of orders.

## Payment Direction Semantics

| DirectionId | Name | Who | Ledger |
|---|---|---|---|
| 1 | Received | Customer pays us | Cash In (TransCategory=5), Credit |
| 2 | Paid | We pay supplier | Cash Out (TransCategory=6), Debit |
| 3 | Adjustment | Manual correction | Cash In (TransCategory=5), Credit |

## Out of Scope (This Sprint)

- Invoice generation (see `todo/08-invoices.md`)
- Expense payments (see `todo/05-expenses.md`)
- Offline sync of payment records (see `todo/10-sync.md`)
- Push notifications on payment receipt (see `todo/11-push-notifications.md`)
