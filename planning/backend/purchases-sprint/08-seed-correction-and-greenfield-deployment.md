# Seed data correction and greenfield deployment

This doc explains how **lookup and category seed data** stay correct for **local dev**, **CI**, and a **fresh production database**—without relying on one-off local fixes that do not travel.

## What “works on local” vs server

- **Migrations still run on the server.** `dotnet ef database update` (or app startup `Migrate()`) applies the **same migration history** to an empty MySQL instance. That creates tables, views, FKs, and leaves **lookup tables empty until seed runs**.
- **What does not transfer** is **ad-hoc data** you fixed manually in phpMyAdmin or one-off SQL on your laptop. Those changes are **not** in `SeedData` or migrations.
- **Greenfield deploy** (empty DB, no legacy rows): the **only** source of truth for categories, statuses, types, etc. should be:
  1. **EF migrations** (schema + view definitions), and  
  2. **`SeedData.EnsureSeedDataAsync`** (or equivalent) for **fixed ids and names**.

So the “correction” is not a special server step—it is making **seeds and views align in code** once; every new environment gets the same result.

## Canonical rules (apply before first prod deploy)

| Topic | Rule |
|-------|------|
| **`trans_categories`** | Names and ids in [`SeedData`](../../../backend/HamzaTex.Api/Data/SeedData.cs) must match what **`v_monthly_profit_loss`** expects—prefer **`trans_category_id`** in view SQL (e.g. `id IN (1,2)`) or **exact name** match—no drift between `Sale`/`Sales`/`Purchase`/`Purchases`. |
| **Views** | Define or migrate views so they do not depend on fragile string typos; **id-based** filters are stable across locales. |
| **Order / Purchase statuses** | Once [`09-purchase-status-workflow.md`](./09-purchase-status-workflow.md) is implemented, seed **stable ids** (1–4) like `OrderStatus`. |
| **Idempotent seed** | Use the same pattern as existing seeds: upsert or fixed ids so re-running startup does not duplicate rows. |

## Greenfield production checklist

1. Create empty MySQL database; connection string in app settings.
2. Run application (or `dotnet ef database update`) so **all migrations** apply—including any view fixes.
3. Confirm **seed** runs and **lookup** rows exist (`trans_categories`, `order_statuses`, `purchase_statuses` when added, etc.).
4. Smoke-test: one order + one purchase path → P&L view buckets non-zero and sensible.

## What you do *not* need on greenfield

- **Separate “data migration” to rename categories** if seeds + views were fixed in code **before** first deploy—there is no old data to repair.
- **Manual re-run of old patch scripts** on prod if prod only ever runs the consolidated migration chain.

## If you ever have a brownfield DB later

Then you need real **data migrations** (SQL updates) to rename existing `trans_categories` rows or re-link FKs. That is a different playbook than **first deploy from empty**.

## Related

- Reporting alignment: [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md).
- Orders planning (same seed/view theme): [../orders-sprint/03-reporting-and-views-alignment.md](../orders-sprint/03-reporting-and-views-alignment.md).
