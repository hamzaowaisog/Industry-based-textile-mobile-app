# Planning

This folder holds **feature- and sprint-level architecture notes** for HamzaTex: business context, data impact, reporting alignment, and how implementation maps to the backend. It is curated by the team as work proceeds.

## How this relates to other doc trees

| Location | Role |
|----------|------|
| **[`_bmad/`](../_bmad/)** | BMAD methodology: workflows, agents, reusable steps. Use when running structured BMAD processes. |
| **[`_bmad-output/planning-artifacts/`](../_bmad-output/planning-artifacts/)** | Generated or frozen outputs from those workflows (e.g. PRD, high-level architecture). |
| **`planning/` (here)** | Practical sprint packs: owner lens, DB/reporting implications, ledger rules, API outlines—**before or alongside** coding. |

## Index

### Backend

| Pack | Status | Description |
|------|--------|-------------|
| [Orders sprint](./backend/orders-sprint/01-business-context-textile.md) | ✅ Complete | Textile business context, lifecycle, cash vs credit. Backend fully implemented. `v_monthly_profit_loss` view bug fixed in migration `20260412100000_FixProfitLossViewCategoryMatching`. Cross-cutting: [`06`](./backend/orders-sprint/06-cross-cutting-risks-and-business-fit.md); kickoff: [`07`](./backend/orders-sprint/07-implementation-kickoff.md). |
| [Purchases sprint](./backend/purchases-sprint/01-business-context-procurement.md) | 🟡 Planning | Procurement: **`PurchaseStatus`** (same routine as orders), **`Transaction.PurchaseId`**, seed + [**greenfield deploy**](./backend/purchases-sprint/08-seed-correction-and-greenfield-deployment.md), workflow [**09**](./backend/purchases-sprint/09-purchase-status-workflow.md). Read `01`–`09`; kickoff [`07`](./backend/purchases-sprint/07-implementation-kickoff.md). |

### Trackers

Implementation checklists live under [`../todo/`](../todo/). [Orders API](../todo/02-orders.md); [Purchases API](../todo/03-purchases.md).

## Conventions

- One subfolder per epic/sprint (e.g. `backend/orders-sprint/`).
- Numbered files for reading order (`01-`, `02-`, …).
- Prefer linking to real paths in `backend/HamzaTex.Api/` when referencing code.
