using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Read-only reporting service exposing DB views and aggregate summaries.</summary>
public interface IReportService
{
    /// <summary>Monthly profit and loss report. Optionally filter by year and/or month.</summary>
    Task<Response<List<ProfitLossViewModel>>> GetMonthlyProfitLossAsync(int? year, int? month, string calendar = "gregorian");

    /// <summary>All client balances from v_client_balance.</summary>
    Task<Response<List<ClientBalanceViewModel>>> GetClientBalancesAsync();

    /// <summary>Single client balance by ID.</summary>
    Task<Response<ClientBalanceViewModel>> GetClientBalanceByIdAsync(int clientId, int userId, bool isAdmin);

    /// <summary>Monthly credit/debit report. Optionally filter by year and/or month.</summary>
    Task<Response<List<CreditDebitViewModel>>> GetMonthlyCreditDebitAsync(int? year, int? month, string calendar = "gregorian");

    /// <summary>Aggregate totals: sales, purchases, expenses amounts + order/purchase/client counts.</summary>
    Task<Response<SummaryTotalsViewModel>> GetSummaryTotalsAsync();

    /// <summary>Per-client breakdown with order/purchase totals and balance.</summary>
    Task<Response<List<ClientDetailViewModel>>> GetClientDetailsAsync();

    /// <summary>Full detail for a single client — orders, purchases, payments, recent transactions, and balance.</summary>
    Task<Response<ClientDetailViewModel>> GetClientDetailByIdAsync(int clientId, int userId, bool isAdmin);
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

public class ReportService : IReportService
{
    private const int StatusDelivered = 3;
    private const int StatusCancelled = 4;
    private const int StatusPaid = 3;
    private const int StatusInvoiceCancelled = 4;

    private readonly ApplicationDbContext _db;

    public ReportService(ApplicationDbContext db)
    {
        _db = db;
    }

    // ── P&L ──────────────────────────────────────────────────────────────────

    public async Task<Response<List<ProfitLossViewModel>>> GetMonthlyProfitLossAsync(int? year, int? month, string calendar = "gregorian")
    {
        if (calendar == "hijri")
        {
            var hijriRows = await _db.VMonthlyProfitLossesHijri.AsNoTracking()
                .Where(v => v.HijriMonth != null)
                .OrderBy(v => v.HijriMonth)
                .ToListAsync();

            hijriRows = HijriDateHelper.FilterByPeriod(hijriRows, r => r.HijriMonth, year, month);

            var hijriResult = hijriRows.Select(r => new ProfitLossViewModel
            {
                Month = HijriDateHelper.FormatHijriMonthLabel(r.HijriMonth),
                TotalSales = r.TotalSales ?? 0,
                TotalPurchases = r.TotalPurchases ?? 0,
                TotalExpenses = r.TotalExpenses ?? 0,
                GrossProfit = r.GrossProfit ?? 0,
                NetProfit = r.NetProfit ?? 0,
            }).ToList();

            return Response<List<ProfitLossViewModel>>.SuccessResponse(hijriResult, "P&L report fetched (Hijri).");
        }

        var query = _db.VMonthlyProfitLosses.AsNoTracking();

        if (year.HasValue)
        {
            var from = new DateTime(year.Value, month ?? 1, 1);
            var to   = month.HasValue ? from.AddMonths(1) : new DateTime(year.Value + 1, 1, 1);
            query = query.Where(r => r.Month.HasValue && r.Month.Value >= from && r.Month.Value < to);
        }
        else if (month.HasValue)
        {
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Month == month.Value);
        }

        var rows = await query.OrderBy(r => r.Month).ToListAsync();

        var result = rows.Select(r => new ProfitLossViewModel
        {
            Month = r.Month?.ToString("MMM yyyy") ?? "N/A",
            TotalSales = r.TotalSales ?? 0,
            TotalPurchases = r.TotalPurchases ?? 0,
            TotalExpenses = r.TotalExpenses ?? 0,
            GrossProfit = r.GrossProfit ?? 0,
            NetProfit = r.NetProfit ?? 0,
        }).ToList();

        return Response<List<ProfitLossViewModel>>.SuccessResponse(result, "P&L report fetched.");
    }

    // ── Client Balance ───────────────────────────────────────────────────────

    public async Task<Response<List<ClientBalanceViewModel>>> GetClientBalancesAsync()
    {
        var result = await (
            from v in _db.VClientBalances.AsNoTracking()
            join c in _db.Clients.AsNoTracking() on v.ClientId equals c.Id
            join ct in _db.ClientTypes.AsNoTracking() on c.ClientTypeId equals ct.Id
            orderby v.Name
            select new ClientBalanceViewModel
            {
                ClientId = v.ClientId ?? 0,
                Name = v.Name ?? string.Empty,
                ClientTypeName = ct.Name ?? "Unknown",
                Balance = v.Balance ?? 0,
            }
        ).ToListAsync();

        return Response<List<ClientBalanceViewModel>>.SuccessResponse(result, "Client balances fetched.");
    }

    public async Task<Response<ClientBalanceViewModel>> GetClientBalanceByIdAsync(int clientId, int userId, bool isAdmin)
    {
        var entity = await (
            from v in _db.VClientBalances.AsNoTracking()
            join c in _db.Clients.AsNoTracking() on v.ClientId equals c.Id
            join ct in _db.ClientTypes.AsNoTracking() on c.ClientTypeId equals ct.Id
            where v.ClientId == clientId && (isAdmin || c.UserId == userId)
            select new ClientBalanceViewModel
            {
                ClientId = v.ClientId ?? 0,
                Name = v.Name ?? string.Empty,
                ClientTypeName = ct.Name ?? "Unknown",
                Balance = v.Balance ?? 0,
            }
        ).FirstOrDefaultAsync();

        if (entity is null)
            return Response<ClientBalanceViewModel>.ErrorResponse("Not found", $"Balance for client '{clientId}' was not found.");

        return Response<ClientBalanceViewModel>.SuccessResponse(entity, "Client balance fetched.");
    }

    // ── Credit / Debit ───────────────────────────────────────────────────────

    public async Task<Response<List<CreditDebitViewModel>>> GetMonthlyCreditDebitAsync(int? year, int? month, string calendar = "gregorian")
    {
        if (calendar == "hijri")
        {
            var hijriRows = await _db.VMonthlyCreditDebitsHijri.AsNoTracking()
                .Where(v => v.HijriMonth != null)
                .OrderBy(v => v.HijriMonth)
                .ToListAsync();

            hijriRows = HijriDateHelper.FilterByPeriod(hijriRows, r => r.HijriMonth, year, month);

            var hijriResult = hijriRows.Select(r => new CreditDebitViewModel
            {
                Month = HijriDateHelper.FormatHijriMonthLabel(r.HijriMonth),
                TotalCredit = r.TotalCredit ?? 0,
                TotalDebit = r.TotalDebit ?? 0,
                Balance = r.Balance ?? 0,
            }).ToList();

            return Response<List<CreditDebitViewModel>>.SuccessResponse(hijriResult, "Credit/debit report fetched (Hijri).");
        }
        
        var query = _db.VMonthlyCreditDebits.AsNoTracking();

        if (year.HasValue)
        {
            var from = new DateTime(year.Value, month ?? 1, 1);
            var to   = month.HasValue ? from.AddMonths(1) : new DateTime(year.Value + 1, 1, 1);
            query = query.Where(r => r.Month.HasValue && r.Month.Value >= from && r.Month.Value < to);
        }
        else if (month.HasValue)
        {
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Month == month.Value);
        }

        var rows = await query.OrderBy(r => r.Month).ToListAsync();
        var result = rows.Select(r => new CreditDebitViewModel
        {
            Month = r.Month?.ToString("MMM yyyy") ?? "N/A",
            TotalCredit = r.TotalCredit ?? 0,
            TotalDebit = r.TotalDebit ?? 0,
            Balance = r.Balance ?? 0,
        }).ToList();

        return Response<List<CreditDebitViewModel>>.SuccessResponse(result, "Credit/debit report fetched.");
    }

    // ── Summary Totals ───────────────────────────────────────────────────────

    public async Task<Response<SummaryTotalsViewModel>> GetSummaryTotalsAsync()
    {
        var salesAmount = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId == 1)
            .SumAsync(t => t.Amount);

        var purchasesAmount = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId == 2)
            .SumAsync(t => t.Amount);

        var expensesAmount = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId == 3 || t.TransCategoryId == 4)
            .SumAsync(t => t.Amount);

        var orderCount = await _db.Orders.CountAsync();
        var purchaseCount = await _db.Purchases.CountAsync();
        var clientCount = await _db.Clients.CountAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentMonthStartD = new DateOnly(today.Year, today.Month, 1);
        var prevMonthStartD = currentMonthStartD.AddMonths(-1);
        var prevMonthDayCount = DateTime.DaysInMonth(prevMonthStartD.Year, prevMonthStartD.Month);
        var prevMonthCutoffD = prevMonthStartD.AddDays(Math.Min(today.Day, prevMonthDayCount) - 1);

        var currentMonthSales = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId == 1 && t.TransDate >= currentMonthStartD && t.TransDate <= today)
            .SumAsync(t => t.Amount);

        var prevMonthSales = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId == 1 && t.TransDate >= prevMonthStartD && t.TransDate <= prevMonthCutoffD)
            .SumAsync(t => t.Amount);

        decimal? salesGrowthPercent = prevMonthSales > 0
            ? Math.Round((currentMonthSales - prevMonthSales) / prevMonthSales * 100, 1)
            : null;

        var avgOrderValue = orderCount > 0 ? Math.Round(salesAmount / orderCount, 2) : 0;

        var activeClientsCurrent = await _db.Transactions.AsNoTracking()
            .Where(t => t.ClientId != null && t.TransDate >= currentMonthStartD && t.TransDate <= today)
            .Select(t => t.ClientId)
            .Distinct()
            .CountAsync();

        var activeClientsPrev = await _db.Transactions.AsNoTracking()
            .Where(t => t.ClientId != null && t.TransDate >= prevMonthStartD && t.TransDate <= prevMonthCutoffD)
            .Select(t => t.ClientId)
            .Distinct()
            .CountAsync();

        var overdueInvoicesCount = await _db.Invoices.AsNoTracking()
            .Where(i => i.DueDate != null && i.DueDate < today && i.InvoiceStatusId != StatusPaid && i.InvoiceStatusId != StatusInvoiceCancelled)
            .CountAsync();

        return Response<SummaryTotalsViewModel>.SuccessResponse(new SummaryTotalsViewModel
        {
            TotalSalesAmount = salesAmount,
            TotalPurchasesAmount = purchasesAmount,
            TotalExpensesAmount = expensesAmount,
            TotalOrderCount = orderCount,
            TotalPurchaseCount = purchaseCount,
            TotalClientsCount = clientCount,
            SalesGrowthPercent = salesGrowthPercent,
            AvgOrderValue = avgOrderValue,
            ActiveClientsCount = activeClientsCurrent,
            ActiveClientsChange = activeClientsCurrent - activeClientsPrev,
            OverdueInvoicesCount = overdueInvoicesCount,
        }, "Summary totals fetched.");
    }

    // ── Client Detail ────────────────────────────────────────────────────────

    public async Task<Response<List<ClientDetailViewModel>>> GetClientDetailsAsync()
    {
        var clients = await _db.Clients.AsNoTracking()
            .Include(c => c.ClientType)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var clientIds = clients.Select(c => (int?)c.Id).ToList();

        var orders = await _db.Orders.AsNoTracking()
            .Include(o => o.OrderLines)
            .Include(o => o.Status)
            .Where(o => clientIds.Contains(o.ClientId))
            .OrderByDescending(o => o.OrderDate).ThenByDescending(o => o.Id)
            .ToListAsync();

        var purchases = await _db.Purchases.AsNoTracking()
            .Include(p => p.PurchaseLines)
            .Include(p => p.Status)
            .Where(p => clientIds.Contains(p.SupplierId))
            .OrderByDescending(p => p.PurchaseDate).ThenByDescending(p => p.Id)
            .ToListAsync();

        var payments = await _db.Payments.AsNoTracking()
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.Allocations)
            .Where(p => clientIds.Contains(p.PartyClientId) && p.OriginalPaymentId == null)
            .OrderByDescending(p => p.PaymentDate).ThenByDescending(p => p.Id)
            .ToListAsync();

        var invoices = await _db.Invoices.AsNoTracking()
            .Include(i => i.InvoiceStatus)
            .Where(i => clientIds.Contains(i.ClientId))
            .OrderByDescending(i => i.IssueDate).ThenByDescending(i => i.Id)
            .ToListAsync();

        var transactions = await _db.Transactions.AsNoTracking()
            .Include(t => t.TransCategory)
            .Include(t => t.TransType)
            .Where(t => clientIds.Contains(t.ClientId))
            .OrderByDescending(t => t.TransDate).ThenByDescending(t => t.Id)
            .ToListAsync();

        var balances = await _db.VClientBalances.AsNoTracking()
            .Where(b => clientIds.Contains(b.ClientId))
            .ToDictionaryAsync(b => b.ClientId ?? 0, b => b.Balance ?? 0);

        var orderAllocations = await GetOrderAllocationsAsync(orders.Select(o => (int?)o.Id).ToList());
        var purchaseAllocations = await GetPurchaseAllocationsAsync(purchases.Select(p => (int?)p.Id).ToList());

        var ordersByClient = orders.GroupBy(o => o.ClientId ?? 0).ToDictionary(g => g.Key, g => g.ToList());
        var purchasesByClient = purchases.GroupBy(p => p.SupplierId ?? 0).ToDictionary(g => g.Key, g => g.ToList());
        var paymentsByClient = payments.GroupBy(p => p.PartyClientId ?? 0).ToDictionary(g => g.Key, g => g.ToList());
        var invoicesByClient = invoices.GroupBy(i => i.ClientId ?? 0).ToDictionary(g => g.Key, g => g.ToList());
        var transactionsByClient = transactions.GroupBy(t => t.ClientId ?? 0).ToDictionary(g => g.Key, g => g.ToList());

        var result = clients.Select(client => BuildClientDetailViewModel(
            client,
            ordersByClient.GetValueOrDefault(client.Id, new List<Order>()),
            purchasesByClient.GetValueOrDefault(client.Id, new List<Purchase>()),
            paymentsByClient.GetValueOrDefault(client.Id, new List<Payment>()),
            invoicesByClient.GetValueOrDefault(client.Id, new List<Invoice>()),
            transactionsByClient.GetValueOrDefault(client.Id, new List<Transaction>()),
            balances.GetValueOrDefault(client.Id, 0),
            orderAllocations,
            purchaseAllocations
        )).ToList();

        return Response<List<ClientDetailViewModel>>.SuccessResponse(result, "Client details fetched.");
    }

    private async Task<Dictionary<int, decimal>> GetOrderAllocationsAsync(List<int?> orderIds)
    {
        if (!orderIds.Any())
            return new Dictionary<int, decimal>();

        return await _db.PaymentAllocations.AsNoTracking()
            .Where(a => orderIds.Contains(a.OrderId) && !a.Payment.IsReversed)
            .GroupBy(a => a.OrderId)
            .ToDictionaryAsync(g => g.Key ?? 0, g => g.Sum(a => a.AllocatedAmount));
    }

    private async Task<Dictionary<int, decimal>> GetPurchaseAllocationsAsync(List<int?> purchaseIds)
    {
        if (!purchaseIds.Any())
            return new Dictionary<int, decimal>();

        return await _db.PaymentAllocations.AsNoTracking()
            .Where(a => purchaseIds.Contains(a.PurchaseId) && !a.Payment.IsReversed)
            .GroupBy(a => a.PurchaseId)
            .ToDictionaryAsync(g => g.Key ?? 0, g => g.Sum(a => a.AllocatedAmount));
    }

    public async Task<Response<ClientDetailViewModel>> GetClientDetailByIdAsync(int clientId, int userId, bool isAdmin)
    {
        var client = await _db.Clients.AsNoTracking()
            .Include(c => c.ClientType)
            .FirstOrDefaultAsync(c => c.Id == clientId && (isAdmin || c.UserId == userId));

        if (client is null)
            return Response<ClientDetailViewModel>.ErrorResponse("Not found", $"Client '{clientId}' was not found.");

        var detail = await BuildClientDetailAsync(client);
        return Response<ClientDetailViewModel>.SuccessResponse(detail, "Client detail fetched.");
    }

    private async Task<ClientDetailViewModel> BuildClientDetailAsync(Client client)
    {
        var clientId = (int?)client.Id;

        // Orders with lines for this client
        var orders = await _db.Orders.AsNoTracking()
            .Include(o => o.OrderLines)
            .Include(o => o.Status)
            .Where(o => o.ClientId == clientId)
            .OrderByDescending(o => o.OrderDate).ThenByDescending(o => o.Id)
            .ToListAsync();

        // Purchases where this client is the supplier
        var purchases = await _db.Purchases.AsNoTracking()
            .Include(p => p.PurchaseLines)
            .Include(p => p.Status)
            .Where(p => p.SupplierId == clientId)
            .OrderByDescending(p => p.PurchaseDate).ThenByDescending(p => p.Id)
            .ToListAsync();

        // Payments for this client
        var payments = await _db.Payments.AsNoTracking()
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.Allocations)
            .Where(p => p.PartyClientId == clientId && p.OriginalPaymentId == null)
            .OrderByDescending(p => p.PaymentDate).ThenByDescending(p => p.Id)
            .ToListAsync();

        // Invoices for this client
        var invoices = await _db.Invoices.AsNoTracking()
            .Include(i => i.InvoiceStatus)
            .Where(i => i.ClientId == clientId)
            .OrderByDescending(i => i.IssueDate).ThenByDescending(i => i.Id)
            .ToListAsync();

        // All transactions for this client — used for both recent-activity and balance history
        var transactions = await _db.Transactions.AsNoTracking()
            .Include(t => t.TransCategory)
            .Include(t => t.TransType)
            .Where(t => t.ClientId == clientId)
            .ToListAsync();

        // Balance from view
        var balanceEntity = await _db.VClientBalances.AsNoTracking()
            .FirstOrDefaultAsync(b => b.ClientId == client.Id);
        var balance = balanceEntity?.Balance ?? 0;

        var orderAllocations = await GetOrderAllocationsAsync(orders.Select(o => (int?)o.Id).ToList());
        var purchaseAllocations = await GetPurchaseAllocationsAsync(purchases.Select(p => (int?)p.Id).ToList());

        return BuildClientDetailViewModel(client, orders, purchases, payments, invoices, transactions, balance, orderAllocations, purchaseAllocations);
    }

    private static ClientDetailViewModel BuildClientDetailViewModel(
        Client client,
        List<Order> orders,
        List<Purchase> purchases,
        List<Payment> payments,
        List<Invoice> invoices,
        List<Transaction> transactions,
        decimal balance,
        Dictionary<int, decimal> orderAllocations,
        Dictionary<int, decimal> purchaseAllocations)
    {
        var orderBillNoById = orders.ToDictionary(o => o.Id, o => o.BillNo);
        var purchaseBillNoById = purchases.ToDictionary(p => p.Id, p => p.BillNo);

        // A Payment split across multiple delivered Orders/Purchases has null OrderId/PurchaseId on its
        // Transaction row (see ledger posting convention), so recover its bill numbers via the payment's allocations.
        var paymentBillNosByTransactionId = payments
            .Where(p => p.TransactionId.HasValue)
            .ToDictionary(
                p => p.TransactionId!.Value,
                p => p.Allocations
                    .Select(a => a.OrderId.HasValue
                        ? orderBillNoById.GetValueOrDefault(a.OrderId.Value)
                        : a.PurchaseId.HasValue
                            ? purchaseBillNoById.GetValueOrDefault(a.PurchaseId.Value)
                            : null)
                    .Where(b => !string.IsNullOrWhiteSpace(b))
                    .Select(b => b!)
                    .Distinct()
                    .ToList());

        List<string> GetTransactionBillNos(Transaction t)
        {
            if (t.OrderId.HasValue)
            {
                var bn = orderBillNoById.GetValueOrDefault(t.OrderId.Value);
                return string.IsNullOrWhiteSpace(bn) ? [] : [bn];
            }
            if (t.PurchaseId.HasValue)
            {
                var bn = purchaseBillNoById.GetValueOrDefault(t.PurchaseId.Value);
                return string.IsNullOrWhiteSpace(bn) ? [] : [bn];
            }
            return paymentBillNosByTransactionId.GetValueOrDefault(t.Id) ?? [];
        }

        var deliveredOrders = orders.Where(o => o.StatusId == StatusDelivered).ToList();
        var deliveredPurchases = purchases.Where(p => p.StatusId == StatusDelivered).ToList();
        var totalOrderAmount = deliveredOrders.Sum(o => o.OrderLines.Sum(l => l.Qty * l.UnitPrice));
        var totalPurchaseAmount = deliveredPurchases.Sum(p => p.PurchaseLines.Sum(l => l.Qty * l.UnitCost));
        var totalPaymentsIn = payments.Where(p => p.PaymentDirectionId == 1 && !p.IsReversed && p.OriginalPaymentId == null).Sum(p => p.Amount);
        var totalPaymentsOut = payments.Where(p => p.PaymentDirectionId == 2 && !p.IsReversed && p.OriginalPaymentId == null).Sum(p => p.Amount);

        var orderSummaries = orders.Select(o =>
        {
            var total = o.OrderLines.Sum(l => l.Qty * l.UnitPrice);
            var paid = orderAllocations.GetValueOrDefault(o.Id, 0);
            var outstanding = total - paid;
            return new ClientOrderSummary
            {
                OrderId = o.Id,
                BillNo = o.BillNo,
                OrderDate = o.OrderDate,
                OrderDateHijriDisplay = HijriDateHelper.FormatForDisplay(o.OrderDateHijri),
                StatusName = o.Status?.Name ?? "Unknown",
                Total = total,
                AmountPaid = paid,
                Outstanding = outstanding < 0 ? 0 : outstanding,
                PaymentStatus = outstanding <= 0 ? "FullyPaid" : paid > 0 ? "PartiallyPaid" : "Unpaid",
            };
        }).ToList();

        var purchaseSummaries = purchases.Select(p =>
        {
            var total = p.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
            var paid = purchaseAllocations.GetValueOrDefault(p.Id, 0);
            var outstanding = total - paid;
            return new ClientPurchaseSummary
            {
                PurchaseId = p.Id,
                BillNo = p.BillNo,
                PurchaseDate = p.PurchaseDate,
                PurchaseDateHijriDisplay = HijriDateHelper.FormatForDisplay(p.PurchaseDateHijri),
                StatusName = p.Status?.Name ?? "Unknown",
                Total = total,
                AmountPaid = paid,
                Outstanding = outstanding < 0 ? 0 : outstanding,
                PaymentStatus = outstanding <= 0 ? "FullyPaid" : paid > 0 ? "PartiallyPaid" : "Unpaid",
            };
        }).ToList();

        return new ClientDetailViewModel
        {
            ClientId = client.Id,
            ClientName = client.Name,
            ClientTypeName = client.ClientType?.Name ?? "Unknown",
            ClientTypeId = client.ClientTypeId ?? 1,
            Phone = client.Phone,
            Address = client.Address,
            CreditLimit = client.CreditLimit,
            OpeningBalance = client.OpeningBalance,
            Notes = client.Notes,
            IsActive = client.IsActive,
            TotalOrderCount = deliveredOrders.Count,
            TotalOrderAmount = totalOrderAmount,
            TotalPurchaseCount = deliveredPurchases.Count,
            TotalPurchaseAmount = totalPurchaseAmount,
            TotalPaymentsIn = totalPaymentsIn,
            TotalPaymentsOut = totalPaymentsOut,
            Outstanding = balance,
            Balance = balance,
            Orders = orderSummaries,
            Purchases = purchaseSummaries,
            Payments = payments.Select(p => new ClientPaymentSummary
            {
                PaymentId = p.Id,
                PaymentDate = p.PaymentDate,
                PaymentDateHijriDisplay = HijriDateHelper.FormatForDisplay(p.PaymentDateHijri),
                DirectionName = p.PaymentDirection?.Name ?? "Unknown",
                ModeName = p.TransMode?.Name ?? "Unknown",
                Amount = p.Amount,
                IsReversed = p.IsReversed,
                BillNos = p.Allocations
                    .Select(a => a.OrderId.HasValue
                        ? orderBillNoById.GetValueOrDefault(a.OrderId.Value)
                        : a.PurchaseId.HasValue
                            ? purchaseBillNoById.GetValueOrDefault(a.PurchaseId.Value)
                            : null)
                    .Where(b => !string.IsNullOrWhiteSpace(b))
                    .Select(b => b!)
                    .ToList(),
                UnallocatedAmount = p.Amount - p.Allocations.Sum(a => a.AllocatedAmount),
            }).ToList(),
            Invoices = invoices.Select(i => new ClientInvoiceSummary
            {
                InvoiceId = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                BillNo = i.OrderId.HasValue
                    ? orderBillNoById.GetValueOrDefault(i.OrderId.Value)
                    : i.PurchaseId.HasValue
                        ? purchaseBillNoById.GetValueOrDefault(i.PurchaseId.Value)
                        : null,
                IssueDate = i.IssueDate,
                IssueDateHijriDisplay = HijriDateHelper.FormatForDisplay(i.IssueDateHijri),
                DueDate = i.DueDate,
                DueDateHijriDisplay = HijriDateHelper.FormatForDisplay(i.DueDateHijri),
                InvoiceStatusId = i.InvoiceStatusId,
                StatusName = i.InvoiceStatus?.Name ?? "Unknown",
                TotalAmount = i.TotalAmount,
            }).ToList(),
            RecentTransactions = transactions
                .OrderByDescending(t => t.TransDate).ThenByDescending(t => t.Id)
                .Take(20)
                .Select(t =>
                {
                    var billNos = GetTransactionBillNos(t);
                    return new ClientTransactionSummary
                {
                    TransactionId = t.Id,
                    BillNo = billNos.Count > 0 ? string.Join(", ", billNos) : null,
                    BillNos = billNos,
                    TransDate = t.TransDate,
                    TransDateHijriDisplay = HijriDateHelper.FormatForDisplay(t.TransDateHijri),
                    CategoryName = t.TransCategory?.Name ?? "Unknown",
                    TypeName = t.TransType?.Name ?? "Unknown",
                    Amount = t.Amount,
                    IsReversal = t.Notes?.StartsWith("REVERSAL of Payment", StringComparison.OrdinalIgnoreCase) ?? false,
                };
                }).ToList(),
            BalanceHistory = BuildBalanceHistory(transactions, client.OpeningBalance ?? 0),
        };
    }

    private const int BalanceHistoryMonths = 6;

    private static List<MonthlyBalancePoint> BuildBalanceHistory(List<Transaction> transactions, decimal openingBalance)
    {
        var ascending = transactions.OrderBy(t => t.TransDate).ThenBy(t => t.Id).ToList();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentMonthStart = new DateOnly(today.Year, today.Month, 1);

        var points = new List<MonthlyBalancePoint>();
        decimal cumulative = openingBalance;
        var txnIndex = 0;

        for (var i = BalanceHistoryMonths - 1; i >= 0; i--)
        {
            var monthStart = currentMonthStart.AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            var cutoff = monthEnd < today ? monthEnd : today;

            while (txnIndex < ascending.Count && ascending[txnIndex].TransDate <= cutoff)
            {
                cumulative += ascending[txnIndex].Amount;
                txnIndex++;
            }

            points.Add(new MonthlyBalancePoint
            {
                Month = monthStart.ToString("MMM yyyy"),
                Balance = cumulative,
            });
        }

        return points;
    }
}
