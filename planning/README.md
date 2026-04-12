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
| [Orders sprint](./backend/orders-sprint/01-business-context-textile.md) | ✅ Complete | Textile business context, lifecycle, cash vs credit. Backend fully implemented. `v_monthly_profit_loss` view bug fixed in migration `20260412100000_FixProfitLossViewCategoryMatching`. |

### Trackers

Implementation checklists live under [`../todo/`](../todo/). Example: [Orders API](../todo/02-orders.md) links to this pack.

## Conventions

- One subfolder per epic/sprint (e.g. `backend/orders-sprint/`).
- Numbered files for reading order (`01-`, `02-`, …).
- Prefer linking to real paths in `backend/HamzaTex.Api/` when referencing code.
