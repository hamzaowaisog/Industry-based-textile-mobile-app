# Reports API

**Epic:** 8 — Accountants and managers get monthly reports
**Status:** 🔴 Not Started

## What Already Exists

- `VMonthlyProfitLoss` entity: `Id`, `Month` (DateTime), `TotalSales`, `TotalPurchases`, `TotalExpenses`, `GrossProfit`, `NetProfit`
- `VClientBalance` entity: `ClientId`, `Name`, `Balance`
- `VMonthlyCreditDebit` entity: `Id`, `Month` (DateTime), `TotalCredit`, `TotalDebit`, `Balance`
- All three are in `ApplicationDbContext` as `DbSet` with `HasNoKey()` or similar view configuration
- `IPdfService` and `PdfService` already working — used by Products, Clients, Users, UserRoles
- No service, no controller, no ViewModels for reports

## Tasks

### ViewModels (`Services/ViewModel/`)

- [ ] Create `ReportViewModel.cs`:
  - `ProfitLossViewModel` — maps from `VMonthlyProfitLoss` (Month, TotalSales, TotalPurchases, TotalExpenses, GrossProfit, NetProfit)
  - `ClientBalanceViewModel` — maps from `VClientBalance` (ClientId, Name, Balance)
  - `CreditDebitViewModel` — maps from `VMonthlyCreditDebit` (Month, TotalCredit, TotalDebit, Balance)

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `ProfitLoss` config to `EntityPdfConfigs` (columns: Month, TotalSales, TotalPurchases, TotalExpenses, GrossProfit, NetProfit)
- [ ] Add `ClientBalance` config to `EntityPdfConfigs` (columns: ClientId, Name, Balance)
- [ ] Add `CreditDebit` config to `EntityPdfConfigs` (columns: Month, TotalCredit, TotalDebit, Balance)

### Service Layer (`Services/`)

- [ ] Create `IReportService` interface with:
  - `Task<Response<List<ProfitLossViewModel>>> GetMonthlyProfitLossAsync(int? year, int? month)`
  - `Task<Response<List<ClientBalanceViewModel>>> GetClientBalancesAsync()`
  - `Task<Response<ClientBalanceViewModel>> GetClientBalanceByIdAsync(int clientId)`
  - `Task<Response<List<CreditDebitViewModel>>> GetMonthlyCreditDebitAsync(int? year, int? month)`
- [ ] Create `ReportService` implementing `IReportService` — queries DB views directly
- [ ] Register as Scoped in `Program.cs`

### Controller (`Controllers/ReportController.cs`)

- [ ] `GET /api/Report/profit-loss` — optional `?year=&month=` query params (AdminOnly)
- [ ] `GET /api/Report/profit-loss/pdf` — PDF of P&L (AdminOnly)
- [ ] `GET /api/Report/client-balance` — all client balances (AdminOnly)
- [ ] `GET /api/Report/client-balance/{clientId}` — single client balance (AdminOrStaff)
- [ ] `GET /api/Report/client-balance/pdf` — PDF of all balances (AdminOnly)
- [ ] `GET /api/Report/credit-debit` — optional `?year=&month=` (AdminOnly)
- [ ] `GET /api/Report/credit-debit/pdf` — PDF of credit/debit (AdminOnly)

## Notes

- All report endpoints are read-only — no POST/PUT/DELETE
- Queries hit the DB views directly; no business logic in `ReportService` beyond querying and mapping
- `VMonthlyProfitLoss.Month` and `VMonthlyCreditDebit.Month` are `DateTime?` — filter by `.Month` and `.Year` properties
- Performance target: all report endpoints < 3s (NFR-P1) — add index hints if views are slow
- FR17, FR18: reports from single source of truth — these views already aggregate from the correct tables
