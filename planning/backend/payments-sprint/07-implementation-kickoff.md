# Payments Sprint — Implementation Kickoff

**Status: ✅ Complete** — All phases delivered. See [`todo/04-payments.md`](../../../todo/04-payments.md) for full checklist.

## What Was Built (in order)

| Phase | Work | Status |
|---|---|---|
| 1 | `PaymentAllocation` entity + `Payment` entity extended (UserId, IsReversed, reversal chain, TransactionId) | ✅ |
| 2 | DbContext: `DbSet<PaymentAllocation>`, EF relationships for allocation, reversal self-ref, user, transaction FKs | ✅ |
| 3 | 3 EF migrations: AllocationTable, AddFieldsToPayment, UpdateVClientBalanceView | ✅ |
| 4 | DTOs: PaymentDto, CreatePaymentDto, UpdatePaymentDto, ReverseAndCorrectPaymentDto, UnallocatedCreditDto, AllocationItemDto | ✅ |
| 5 | ViewModels + FluentValidation (Create, Update, ReverseAndCorrect) | ✅ |
| 6 | `IPaymentService` + `PaymentService` (11 methods: FIFO, manual alloc, ledger, reverse, reverse-and-correct) | ✅ |
| 7 | `PaymentController` — 12 endpoints | ✅ |
| 8 | `EntityPdfConfigs.Payment`, `OrderDto`/`PurchaseDto` extended, `ClientService` deletion guard, DI registration | ✅ |
| 9 | Build verification — 0 errors | ✅ |

## Bugs Fixed During Implementation

- `ToValidationResponseFromModelState<T>()` returns `Response<T>` not `IActionResult` — must wrap with `ToActionResult()` (CS0266)
- `IPdfService.CreatePdf` called with wrong signature — missing title and description params (CS7036)
- `orders.Select(ToDto)` / `purchases.Select(ToDto)` resolved as wrong delegate overload after optional param added — changed to lambda `.Select(o => ToDto(o))` (CS0123)
- `OrderService.GetAllPaginatedAsync` and `PurchaseService.GetAllPaginatedAsync` — EF expression tree cannot call methods with optional parameters (CS0854) — fixed by paginating entity IQueryable first, then mapping in-memory with `new PagedList<T>(...)`
- **sed corruption (×2)** — `sed` emptied `Program.cs` and `OrderService.cs` to 0 bytes during implementation. Recovered via `git checkout`. Lesson: never use `sed` — always use Edit tool.

## Migrations Applied

| Migration | Change |
|---|---|
| `AddPaymentAllocationTable` | `payment_allocations` table with FKs to payments, orders, purchases |
| `AddFieldsToPayment` | `user_id`, `is_reversed`, `reversed_by_payment_id`, `original_payment_id`, `transaction_id` on `payments` |
| `UpdateVClientBalanceView` | Drops + recreates `v_client_balance` to join against payments table directly |

## Preconditions (Satisfied)

- Orders and Purchases sprints complete — allocation references valid Order/Purchase FKs
- `PaymentDirection` and `TransMode` already seeded
- `Transaction` entity already has optional `OrderId`/`PurchaseId` FKs wired

## Out of Scope (Deferred)

- Expense payments (separate Expenses sprint — `todo/05-expenses.md`)
- Invoice PDF tied to payment (Invoices sprint — `todo/08-invoices.md`)
- Optimistic concurrency on allocation exhaustion (low risk, single tenant)
- Offline payment sync (`todo/10-sync.md`)

## Related

- [`01`](./01-business-context-payments.md) — Business context & edge cases
- [`02`](./02-data-model-and-db-impact.md) — Data model & migrations
- [`03`](./03-ledger-posting-rules.md) — Ledger rules
- [`04`](./04-allocation-design.md) — FIFO & manual allocation design
- [`05`](./05-api-and-service-outline.md) — API endpoints & DTOs
- [`06`](./06-cross-cutting-risks.md) — Risks & decisions
- Purchases kickoff: [`../purchases-sprint/07-implementation-kickoff.md`](../purchases-sprint/07-implementation-kickoff.md)
