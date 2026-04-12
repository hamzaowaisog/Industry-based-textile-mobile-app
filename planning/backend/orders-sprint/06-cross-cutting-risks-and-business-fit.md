# Cross-cutting risks, database impact, and business fit

Use this doc to **highlight what to add** to the roadmap and to sanity-check whether the architecture matches your business criteria. It complements the Orders-focused docs (`01`–`05`) by zooming out to the **whole database** and **adjacent epics**.

---

## 1. Sales vs purchasing — two concepts in the schema

In HamzaTex, **“order” in the database means a sale**, not a purchase.

| Business action | Entity | Counterparty | Stock |
|-----------------|--------|--------------|--------|
| Sell to a customer | `Order` + `OrderLine` | `Client` with **Customer** (`ClientTypeId = 1`) | `StockMovement` with **Sale** source → **Out** |
| Buy from a supplier | `Purchase` + `PurchaseLine` | `Client` with **Supplier** (`ClientTypeId = 2`) | `StockMovement` with **Purchase** source → **In** |

**Implication:** Staff cannot “purchase” using the Orders API; procurement is the **Purchases** epic ([`todo/03-purchases.md`](../../../todo/03-purchases.md)).

**Product decision (locked):** The app will use **two separate screens**—one for **Orders** (sales) and one for **Purchases** (procurement)—aligned with two backend document types and stock direction (Out vs In). See [07-implementation-kickoff.md](./07-implementation-kickoff.md) for kickoff notes and coding order.

**Analysis status:** Gaps in §3 and high-impact areas in §2 were **reviewed and accepted** as the real integration surface—we address **root causes** (views, ledger rows, `StockMovementsService` usage) in implementation, not UI-only workarounds. Kickoff sequence: [07-implementation-kickoff.md](./07-implementation-kickoff.md).

---

## 2. High-impact areas (small mistakes → large blast radius)

These are the integration points where errors propagate to **inventory**, **P&L**, and **balances**.

| Area | Why it matters |
|------|----------------|
| **`transactions` + SQL views** | [`v_monthly_profit_loss`](../../../backend/HamzaTex.Api/Migrations/20260204131656_UpdateMonthlyProfitLossView.cs) and [`v_client_balance`](../../../backend/HamzaTex.Api/Migrations/20251215131335_AddViews.cs) read **ledger rows**, not `orders` / `purchases` directly. Wrong category, name mismatch (`Sale` vs `Sales`), sign, or date → wrong **monthly reports** and **customer balances**. |
| **`StockMovementsService.CreateAsync`** | Single place for **qty** and **weighted averages** on [`Product`](../../../backend/HamzaTex.Api/Entities/Product.cs). Duplicating logic or double-posting → inventory and margin context drift. |
| **`Client` type and `UserId`** | Validates **Customer vs Supplier** for the right document; **scoping** (who sees which clients/orders) flows through `Client.UserId` because `Order` has **no `UserId`**. |
| **Shared lookups** | [`PaymentType`](../../../backend/HamzaTex.Api/Entities/PaymentType.cs), `TransCategory`, `TransType`, `TransMode` are reused across Orders, Purchases, and future Payments/Expenses — inconsistency breaks **reconciliation**. |
| **Traceability gaps** | [`StockMovement`](../../../backend/HamzaTex.Api/Entities/StockMovement.cs) and [`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) do not currently carry `OrderId` / `PurchaseId`. Disputes and audits are harder; reversals must infer source indirectly. |

---

## 3. Known gaps and future problems (prioritize by business pain)

| Topic | Risk if left weak | Typical “add this” follow-up |
|-------|-------------------|------------------------------|
| **P&L view vs seed naming** | Sales missing or mis-bucketed in `v_monthly_profit_loss` | Align `Sale` / `Sales` / `trans_category_id` — see [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md). |
| **Ledger posting for orders** | Operations show deliveries; finance shows no revenue | Implement posting rules in [04-ledger-posting-rules.md](./04-ledger-posting-rules.md); verify views. |
| **Purchases API** | Buying stays outside the system | Implement [`todo/03-purchases.md`](../../../todo/03-purchases.md) with same rigor as Orders (stock **In**, cost averages). |
| **Payments** | Credit sales never “settle” in data | [`todo/04-payments.md`](../../../todo/04-payments.md) for cash/credit application to balances. |
| **Transactions CRUD API** | Manual corrections only via DB | [`todo/06-transactions.md`](../../../todo/06-transactions.md) when you need controlled adjustments. |
| **Sync / offline** | Field duplicates or data loss | [`todo/10-sync.md`](../../../todo/10-sync.md) — conflict strategy and `UpdatedAt` story. |
| **FKs from movements/ledger to documents** | Weak audit and reversal | Optional migrations: `order_id` / `purchase_id` on `stock_movements` and/or `transactions`. |

---

## 4. Business fit checklist (pass/fail per criterion)

Use this when deciding if the current plan **meets** your criteria.

| # | Question | Pass means |
|---|----------|------------|
| 1 | Do we need **both** selling and buying in the product soon? | Roadmap includes **Orders** and **Purchases** (and shared stock rules), or explicit deferral. |
| 2 | When is **revenue** recognized vs **inventory out**? | Rules are explicit (e.g. **Delivered**); staff and finance agree. |
| 3 | Must **monthly P&L** and **client balance** match operations? | `transactions` + views aligned; tested with real scenarios. |
| 4 | Do we need **traceability** (“which order caused this movement”)? | Plan to add **reference IDs** or FKs on movements/transactions. |
| 5 | Is **credit** a first-class concern? | **Payments** epic scheduled; `PaymentType` on order is not enough alone. |
| 6 | Is **offline / mobile** critical? | **Sync** design is scheduled before you promise field reliability. |

---

## 5. Suggested highlights to add (copy into your backlog)

Pick what applies; these are **not** all mandatory for every business.

- [x] **Product:** Separate **Orders** vs **Purchases** screens (locked).
- [x] **Orders backend:** Full CRUD + lifecycle (Delivered: stock out + ledger; Cancelled: reversals) — complete as of 2026-04-13.
- [x] ✅ **Reporting:** `v_monthly_profit_loss` fixed — migration `20260412100000_FixProfitLossViewCategoryMatching` switched to `trans_category_id` matching. P&L now includes order sales. See [`03-reporting-and-views-alignment.md`](./03-reporting-and-views-alignment.md).
- [ ] **Data:** Migration for nullable `order_id` on `stock_movements` / `transactions` — deferred, not blocking.
- [ ] **Finance:** Document sign convention for `Transaction.Amount` vs `v_client_balance` / `v_monthly_credit_debit` — do before Payments epic.
- [ ] **Epics:** Orders ✅ → **Purchases next** ([`todo/03-purchases.md`](../../../todo/03-purchases.md)) → Payments.
- [ ] **Compliance / audit:** Export or report linking order → movements → ledger rows for a date range — deferred to Epic 9.

---

## Related docs

- Orders pack: [`01`](./01-business-context-textile.md)–[`05`](./05-api-and-service-outline.md); **start coding:** [`07`](./07-implementation-kickoff.md).
- Tracker: [`todo/02-orders.md`](../../../todo/02-orders.md), [`todo/03-purchases.md`](../../../todo/03-purchases.md).
