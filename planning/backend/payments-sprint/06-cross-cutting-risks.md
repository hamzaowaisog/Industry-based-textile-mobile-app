# Payments Sprint — Cross-Cutting Risks & Decisions

## Risks Identified & Resolved

### Risk 1: Over-allocation on manual input
**Risk:** Staff manually allocates more than a document's outstanding balance.
**Resolution:** `ValidateManualAllocations` checks each allocation's `AllocatedAmount` against `outstanding = total - existing_allocations` and returns an error if exceeded.

### Risk 2: Double-counting client balance
**Risk:** If payment transactions included `ClientId`, the v_client_balance view would double-count (once from order/purchase transaction, once from payment transaction).
**Resolution:** Payment transactions always have `ClientId = NULL`. v_client_balance redesigned to read payments table directly.

### Risk 3: Reversal without audit trail
**Risk:** Simply deleting a wrong payment destroys the audit trail.
**Resolution:** Reversal creates a new payment row (`OriginalPaymentId` set) and a mirror transaction. Original is flagged `IsReversed = true` but never deleted.

### Risk 4: Wrong-client correction atomicity
**Risk:** If reverse succeeds but re-create fails (e.g. new client doesn't exist), data is left in an inconsistent state.
**Resolution:** `ReverseAndCorrectAsync` wraps both operations in a single EF transaction scope — if re-create fails, the whole thing rolls back.

### Risk 5: Concurrent allocation exhausting order balance
**Risk:** Two staff members simultaneously allocate from the same order, both checking outstanding before either commits.
**Resolution:** Deferred — current risk is low in single-tenant small business context. Can be addressed with optimistic concurrency (EF row version) in a future sprint.

### Risk 6: Reversed payment included in balance
**Risk:** Reversed payment still counts against client balance.
**Resolution:** v_client_balance filters `WHERE is_reversed = 0` on payments table.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Allocation storage | `PaymentAllocation` join table | Supports multi-document allocation and per-document outstanding tracking |
| Auto vs manual allocation | Both supported | FIFO auto for convenience, manual for corrections |
| Transaction ClientId | NULL | Avoids double-counting in v_client_balance |
| Immutable fields after create | Amount, PartyClientId | Changing these would invalidate ledger entries — reverse instead |
| Reversal flow | New payment row + mirror transaction | Full audit trail, no data loss |
| v_client_balance redesign | Read from payments table | More accurate — previous design only used transactions |

## Cross-Cutting Changes Made

- `OrderDto` extended with `AmountPaid`, `Outstanding`, `PaymentStatus` (computed from allocations)
- `PurchaseDto` extended with `AmountPaid`, `Outstanding`, `PaymentStatus`
- `ClientService.DeleteByIdAsync` now guards against deletion when payment history exists
- `OrderService.GetAllPaginatedAsync` and `PurchaseService.GetAllPaginatedAsync` fixed (CS0854 — paginate entity first, map in-memory)
