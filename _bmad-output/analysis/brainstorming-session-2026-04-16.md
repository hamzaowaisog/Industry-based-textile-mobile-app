---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: [CLAUDE.md, todo/03-purchases.md, todo/04-payments.md, todo/05-expenses.md, todo/06-transactions.md]
session_topic: 'Payments API Sprint — backend only'
session_goals: 'Comprehensive plan with zero missed edge cases from CFO/CTO/CEO perspective'
selected_approach: 'ai-recommended'
techniques_used: ['role-playing', 'morphological-analysis', 'assumption-reversal', 'decision-tree-mapping']
context_file: 'CLAUDE.md'
---

# Brainstorming Session — Payments API Sprint Plan

**Facilitator:** mhamzaog
**Date:** 2026-04-16
**Scope:** Backend only — Payments API (HamzaTex ERP)

---

## Session Overview

**Topic:** Full Payments API — supplier payments + customer receipts with allocation, reversal, and ledger integrity
**Goals:** Zero missed edge cases; plan covers CEO (business), CFO (accounting), CTO (architecture) perspectives
**Technique sequence:** Role Playing → Morphological Analysis → Assumption Reversal → Decision Tree Mapping

---

## Phase 1 — Role Playing: Key Findings

### CEO — Business Scenarios
- Customer pays for specific order(s)
- Customer pays lump sum covering multiple orders
- We pay supplier for specific purchase(s)
- We pay supplier advance (no purchase yet)

### CFO — Financial Requirements
- Every payment must post to the ledger (Transaction)
- Payments must be traceable to orders/purchases for AR/AP reconciliation
- Reversed entries must never be deleted — audit trail must be preserved
- Unallocated credit must be visible per client
- v_client_balance must reflect payments, not just orders/purchases

### CTO — Architecture Decisions
- Payment entity currently missing: UserId, OrderId/PurchaseId linkage, reversal fields
- Solution: PaymentAllocation join table (not simple FK) — supports multi-order allocation
- v_client_balance must be redesigned to read from payments table directly
- Transaction for payment has ClientId=NULL — cash flow only, client balance via payments table

---

## Phase 2 — Morphological Analysis: Full Scenario Matrix

### Direction × Client Type
| Direction | Client must be |
|---|---|
| Received (1) | Customer (ClientTypeId=1) |
| Paid (2) | Supplier (ClientTypeId=2) OR Customer for refunds |
| Adjustment (3) | Any |

### Direction × Mode → Ledger Posting
| Direction | TransMode | TransCategoryId | TransTypeId | ClientId | Amount |
|---|---|---|---|---|---|
| Received | Cash (1) | Cash In (5) | Credit (2) | NULL | +amount |
| Received | Bank (2) | Bank In (7) | Credit (2) | NULL | +amount |
| Received | Credit (3) | Sales (1) | Credit (2) | NULL | +amount |
| Paid | Cash (1) | Cash Out (6) | Debit (1) | NULL | +amount |
| Paid | Bank (2) | Bank Out (8) | Debit (1) | NULL | +amount |
| Paid | Credit (3) | Purchases (2) | Debit (1) | NULL | +amount |

### Allocation Scenarios
| Scenario | allocations[] | Behaviour |
|---|---|---|
| Full order payment | [{OrderId:1, 40k}] | Order #1 fully settled |
| Multi-order auto FIFO | [] empty | System fills oldest unpaid orders first |
| Multi-order manual | [{OrderId:1,40k},{OrderId:2,80k}] | Explicit split |
| Supplier purchase payment | [{PurchaseId:3, 60k}] | Purchase partially/fully settled |
| Pure advance | [] with amount | Unallocated credit on client |
| Mixed | [{OrderId:1,40k}] with 120k total | 40k to Order #1, 80k unallocated |

---

## Phase 3 — Assumption Reversal: Gaps Found

| Assumption Challenged | Gap Found | Fix |
|---|---|---|
| "Paid → Supplier only" | Refund to customer needs Paid→Customer | Allow Paid to Customer for refunds |
| "Staff sees all payments" | No UserId on Payment = no scoping | Add UserId field + /me endpoint |
| "Deleting client is safe" | Client with payment history → cascade disaster | Block delete if payment history exists |
| "Reversal only fixes wrong client" | Wrong amount also needs reversal | Add POST /{id}/reverse (amount-only) |
| "Reversal can happen multiple times" | Infinite reversal loops | Guard: IsReversed=true blocks re-reversal |
| "Unallocated credit is invisible" | Staff double-charges customer | Add GET /unallocated/{clientId} endpoint |
| "PDF shows IDs" | Useless for accountant | PaymentDto must resolve all names |
| "Payment can't be edited for amount" | Fat-finger PKR 12k vs 120k | Reverse + recreate flow covers this |

---

## Phase 4 — Decision Tree: Locked Decisions

### Final Entity — Payment (additions to existing)
```csharp
public int UserId { get; set; }
public ApplicationUser User { get; set; }
public bool IsReversed { get; set; }
public int? ReversedByPaymentId { get; set; }
public int? OriginalPaymentId { get; set; }
public int? TransactionId { get; set; }
public Transaction? Transaction { get; set; }
public ICollection<PaymentAllocation> Allocations { get; set; }
```

### Final Entity — PaymentAllocation (new)
```csharp
public int Id { get; set; }
public int PaymentId { get; set; }
public Payment Payment { get; set; }
public int? OrderId { get; set; }
public Order? Order { get; set; }
public int? PurchaseId { get; set; }
public Purchase? Purchase { get; set; }
public decimal AllocatedAmount { get; set; }  // decimal(14,4)
```

### Migrations (3)
1. AddPaymentAllocationTable
2. AddFieldsToPayment (UserId, IsReversed, reversal FKs, TransactionId)
3. UpdateVClientBalanceView (raw SQL migration)

### v_client_balance Redesign
```sql
CREATE VIEW v_client_balance AS
-- Customer balances
SELECT c.id AS client_id, c.name,
  COALESCE(t.order_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (SELECT client_id, SUM(amount) AS order_total FROM transactions
           WHERE trans_category_id = 1 GROUP BY client_id) t ON t.client_id = c.id
LEFT JOIN (SELECT party_client_id, SUM(amount) AS paid_total FROM payments
           WHERE payment_direction_id = 1 AND is_reversed = 0
           GROUP BY party_client_id) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

-- Supplier balances
SELECT c.id, c.name,
  COALESCE(t.purchase_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (SELECT client_id, SUM(amount) AS purchase_total FROM transactions
           WHERE trans_category_id = 2 GROUP BY client_id) t ON t.client_id = c.id
LEFT JOIN (SELECT party_client_id, SUM(amount) AS paid_total FROM payments
           WHERE payment_direction_id = 2 AND is_reversed = 0
           GROUP BY party_client_id) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;
```

### Final API Endpoints (12)
| Method | Route | Auth |
|---|---|---|
| POST | /api/Payment | AdminOrStaff |
| GET | /api/Payment | AdminOnly |
| GET | /api/Payment/me | Authenticated |
| GET | /api/Payment/{id} | Authenticated |
| GET | /api/Payment/by-client/{clientId} | Authenticated |
| GET | /api/Payment/filtered | Authenticated |
| GET | /api/Payment/unallocated/{clientId} | Authenticated |
| PUT | /api/Payment/{id} | AdminOrStaff |
| POST | /api/Payment/{id}/reverse | AdminOnly |
| POST | /api/Payment/{id}/reverse-and-correct | AdminOnly |
| DELETE | /api/Payment/{id} | AdminOnly |
| GET | /api/Payment/pdf | AdminOrStaff |

---

## Implementation Checklist (in order)

### STEP 1 — Entities
- [ ] Add UserId, IsReversed, ReversedByPaymentId, OriginalPaymentId, TransactionId to Payment entity
- [ ] Create PaymentAllocation entity
- [ ] Add DbSet<PaymentAllocation> to ApplicationDbContext
- [ ] Wire EF relationships in OnModelCreating

### STEP 2 — Migrations
- [ ] dotnet ef migrations add AddPaymentAllocationTable
- [ ] dotnet ef migrations add AddFieldsToPayment
- [ ] dotnet ef migrations add UpdateVClientBalanceView (raw SQL)

### STEP 3 — DTOs
- [ ] PaymentDto (resolved names, IsReversed, IsCashSettled, Allocations[])
- [ ] PaymentAllocationDto
- [ ] CreatePaymentDto (with AllocationItems[])
- [ ] UpdatePaymentDto (notes/date/mode only)
- [ ] ReverseAndCorrectPaymentDto
- [ ] UnallocatedCreditDto

### STEP 4 — ViewModels + Validation
- [ ] PaymentCreateViewModel + AllocationItemViewModel
- [ ] PaymentUpdateViewModel
- [ ] ReverseAndCorrectViewModel
- [ ] PaymentCreateViewModelValidation
- [ ] PaymentUpdateViewModelValidation

### STEP 5 — Service
- [ ] IPaymentService interface (11 methods, XML doc on all)
- [ ] PaymentService.CreateAsync (FIFO + manual allocation + ledger post)
- [ ] PaymentService.GetByIdAsync / GetAllPaginatedAsync / GetAllByClientIdAsync
- [ ] PaymentService.GetAllByUserIdAsync / GetFilteredAsync
- [ ] PaymentService.UpdateByIdAsync
- [ ] PaymentService.ReverseAsync
- [ ] PaymentService.ReverseAndCorrectAsync
- [ ] PaymentService.GetUnallocatedCreditAsync
- [ ] PaymentService.DeleteByIdAsync
- [ ] Register IPaymentService as Scoped in Program.cs

### STEP 6 — Controller
- [ ] PaymentController (12 endpoints, XML docs, ProducesResponseType on all)
- [ ] GetUserId() private helper

### STEP 7 — PDF Config
- [ ] EntityPdfConfigs.Payment in Models/PdfConfig.cs

### STEP 8 — Cross-cutting Updates
- [ ] ClientService.DeleteByIdAsync — block if payment history exists
- [ ] OrderDto + PurchaseDto — add AmountPaid, Outstanding, PaymentStatus
- [ ] OrderService + PurchaseService — populate new fields from PaymentAllocation SUM

---

## Out of Scope (Deferred)
- Split-mode payments (cash + bank in one payment) — use two payment records
- Period locking — future feature
- Multi-currency — out of scope
- Auto-apply unallocated credit on new order creation — frontend UX concern
