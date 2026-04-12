# Seed data correction and greenfield deployment

**Status: ✅ Resolved** — Seeds and migrations are correct and self-contained. Greenfield deploy works from empty DB.

## What "works on local" vs server

- **Migrations still run on the server.** `dotnet run` calls `dbContext.Database.Migrate()` at startup — applies the full migration chain to an empty MySQL instance.
- **`SeedData.EnsureSeedDataAsync`** runs on every startup — idempotent, inserts rows only if missing. Produces `purchase_statuses` (and all other lookups) automatically.
- **Ad-hoc local SQL** is not relied upon — all fixes are in code (seeds + migrations).

## Canonical rules applied ✅

| Topic | Rule |
|-------|------|
| **`trans_categories`** | Seeds use exact names; `v_monthly_profit_loss` was updated to use `trans_category_id` (id-based — no `Purchase` vs `Purchases` name drift) |
| **Views** | `v_monthly_profit_loss`, `v_client_balance`, `v_monthly_credit_debit` all migrated with id-based filters |
| **`purchase_statuses`** | Seeded with stable ids 1–4 (Pending, InProgressed, Delivered, Cancelled) matching `order_statuses` pattern |
| **Idempotent seed** | All seed calls use upsert pattern — re-running startup is safe |

## Greenfield production checklist ✅

1. Create empty MySQL database; add connection string to `appsettings.json`.
2. `dotnet run` — auto-migrates all tables/views/FKs and seeds all lookup tables.
3. Verify `purchase_statuses` rows exist (ids 1–4).
4. Smoke test: create purchase → set Delivered → check `v_monthly_profit_loss` shows `total_purchases` for the month.
5. Verify `v_client_balance` shows positive balance for supplier after Delivered.
6. Verify `v_monthly_credit_debit` shows `total_debit` increase (not credit) for the purchase.

## Generate SQL script for manual deploy

```bash
cd backend/HamzaTex.Api
dotnet ef migrations script --idempotent --output scripts.sql
```

This produces an idempotent SQL file covering all migrations — safe to run on a DB at any point in the migration chain.

## If you ever have a brownfield DB later

Then you need real **data migrations** (SQL `UPDATE` statements) to rename existing `trans_categories` rows or re-link FKs. That is a different playbook than first deploy from empty.

## Related

- Reporting alignment: [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md).
- Orders planning (same seed/view theme): [../orders-sprint/03-reporting-and-views-alignment.md](../orders-sprint/03-reporting-and-views-alignment.md).
