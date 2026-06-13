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
    Task<Response<List<ProfitLossViewModel>>> GetMonthlyProfitLossAsync(int? year, int? month);

    /// <summary>All client balances from v_client_balance.</summary>
    Task<Response<List<ClientBalanceViewModel>>> GetClientBalancesAsync();

    /// <summary>Single client balance by ID.</summary>
    Task<Response<ClientBalanceViewModel>> GetClientBalanceByIdAsync(int clientId);

    /// <summary>Monthly credit/debit report. Optionally filter by year and/or month.</summary>
    Task<Response<List<CreditDebitViewModel>>> GetMonthlyCreditDebitAsync(int? year, int? month);

    /// <summary>Aggregate totals: sales, purchases, expenses amounts + order/purchase/client counts.</summary>
    Task<Response<SummaryTotalsViewModel>> GetSummaryTotalsAsync();

    /// <summary>Per-client breakdown with order/purchase totals and balance.</summary>
    Task<Response<List<ClientDetailViewModel>>> GetClientDetailsAsync();

    /// <summary>Full detail for a single client — orders, purchases, payments, recent transactions, and balance.</summary>
    Task<Response<ClientDetailViewModel>> GetClientDetailByIdAsync(int clientId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _db;

    public ReportService(ApplicationDbContext db)
    {
        _db = db;
    }

    // ── P&L ──────────────────────────────────────────────────────────────────

    public async Task<Response<List<ProfitLossViewModel>>> GetMonthlyProfitLossAsync(int? year, int? month)
    {
        var query = _db.VMonthlyProfitLosses.AsNoTracking().AsEnumerable();

        if (year.HasValue)
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Year == year.Value);

        if (month.HasValue)
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Month == month.Value);

        var result = query
            .OrderBy(r => r.Month)
            .Select(r => new ProfitLossViewModel
            {
                Month = r.Month?.ToString("MMM yyyy") ?? "N/A",
                TotalSales = r.TotalSales ?? 0,
                TotalPurchases = r.TotalPurchases ?? 0,
                TotalExpenses = r.TotalExpenses ?? 0,
                GrossProfit = r.GrossProfit ?? 0,
                NetProfit = r.NetProfit ?? 0,
            })
            .ToList();

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

    public async Task<Response<ClientBalanceViewModel>> GetClientBalanceByIdAsync(int clientId)
    {
        var entity = await (
            from v in _db.VClientBalances.AsNoTracking()
            join c in _db.Clients.AsNoTracking() on v.ClientId equals c.Id
            join ct in _db.ClientTypes.AsNoTracking() on c.ClientTypeId equals ct.Id
            where v.ClientId == clientId
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

    public async Task<Response<List<CreditDebitViewModel>>> GetMonthlyCreditDebitAsync(int? year, int? month)
    {
        var query = _db.VMonthlyCreditDebits.AsNoTracking().AsEnumerable();

        if (year.HasValue)
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Year == year.Value);

        if (month.HasValue)
            query = query.Where(r => r.Month.HasValue && r.Month.Value.Month == month.Value);

        var result = query
            .OrderBy(r => r.Month)
            .Select(r => new CreditDebitViewModel
            {
                Month = r.Month?.ToString("MMM yyyy") ?? "N/A",
                TotalCredit = r.TotalCredit ?? 0,
                TotalDebit = r.TotalDebit ?? 0,
                Balance = r.Balance ?? 0,
            })
            .ToList();

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

        return Response<SummaryTotalsViewModel>.SuccessResponse(new SummaryTotalsViewModel
        {
            TotalSalesAmount = salesAmount,
            TotalPurchasesAmount = purchasesAmount,
            TotalExpensesAmount = expensesAmount,
            TotalOrderCount = orderCount,
            TotalPurchaseCount = purchaseCount,
            TotalClientsCount = clientCount,
        }, "Summary totals fetched.");
    }

    // ── Client Detail ────────────────────────────────────────────────────────

    public async Task<Response<List<ClientDetailViewModel>>> GetClientDetailsAsync()
    {
        var clients = await _db.Clients.AsNoTracking()
            .Include(c => c.ClientType)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var result = new List<ClientDetailViewModel>();
        foreach (var client in clients)
            result.Add(await BuildClientDetailAsync(client));

        return Response<List<ClientDetailViewModel>>.SuccessResponse(result, "Client details fetched.");
    }

    public async Task<Response<ClientDetailViewModel>> GetClientDetailByIdAsync(int clientId)
    {
        var client = await _db.Clients.AsNoTracking()
            .Include(c => c.ClientType)
            .FirstOrDefaultAsync(c => c.Id == clientId);

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
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        // Purchases where this client is the supplier
        var purchases = await _db.Purchases.AsNoTracking()
            .Include(p => p.PurchaseLines)
            .Include(p => p.Status)
            .Where(p => p.SupplierId == clientId)
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync();

        // Payments for this client
        var payments = await _db.Payments.AsNoTracking()
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Where(p => p.PartyClientId == clientId && p.OriginalPaymentId == null)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();

        // Invoices for this client
        var invoices = await _db.Invoices.AsNoTracking()
            .Include(i => i.InvoiceStatus)
            .Where(i => i.ClientId == clientId)
            .OrderByDescending(i => i.IssueDate)
            .ToListAsync();

        // Recent transactions for this client
        var transactions = await _db.Transactions.AsNoTracking()
            .Include(t => t.TransCategory)
            .Include(t => t.TransType)
            .Where(t => t.ClientId == clientId)
            .OrderByDescending(t => t.TransDate)
            .Take(20)
            .ToListAsync();

        // Balance from view
        var balanceEntity = await _db.VClientBalances.AsNoTracking()
            .FirstOrDefaultAsync(b => b.ClientId == client.Id);
        var balance = balanceEntity?.Balance ?? 0;

        // Compute totals
        var totalOrderAmount = orders.Sum(o => o.OrderLines.Sum(l => l.Qty * l.UnitPrice));
        var totalPurchaseAmount = purchases.Sum(p => p.PurchaseLines.Sum(l => l.Qty * l.UnitCost));
        var totalPaymentsIn = payments.Where(p => p.PaymentDirectionId == 1 && !p.IsReversed && p.OriginalPaymentId == null).Sum(p => p.Amount);
        var totalPaymentsOut = payments.Where(p => p.PaymentDirectionId == 2 && !p.IsReversed && p.OriginalPaymentId == null).Sum(p => p.Amount);

        // Compute per-order paid/outstanding via allocations
        var orderIds = orders.Select(o => (int?)o.Id).ToList();
        var orderAllocations = orderIds.Any()
            ? await _db.PaymentAllocations.AsNoTracking()
                .Where(a => orderIds.Contains(a.OrderId) && !a.Payment.IsReversed)
                .GroupBy(a => a.OrderId)
                .ToDictionaryAsync(g => g.Key ?? 0, g => g.Sum(a => a.AllocatedAmount))
            : new Dictionary<int, decimal>();

        var purchaseIds = purchases.Select(p => (int?)p.Id).ToList();
        var purchaseAllocations = purchaseIds.Any()
            ? await _db.PaymentAllocations.AsNoTracking()
                .Where(a => purchaseIds.Contains(a.PurchaseId) && !a.Payment.IsReversed)
                .GroupBy(a => a.PurchaseId)
                .ToDictionaryAsync(g => g.Key ?? 0, g => g.Sum(a => a.AllocatedAmount))
            : new Dictionary<int, decimal>();

        var orderSummaries = orders.Select(o =>
        {
            var total = o.OrderLines.Sum(l => l.Qty * l.UnitPrice);
            var paid = orderAllocations.GetValueOrDefault(o.Id, 0);
            var outstanding = total - paid;
            return new ClientOrderSummary
            {
                OrderId = o.Id,
                OrderDate = o.OrderDate,
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
                PurchaseDate = p.PurchaseDate,
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
            TotalOrderCount = orders.Count,
            TotalOrderAmount = totalOrderAmount,
            TotalPurchaseCount = purchases.Count,
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
                DirectionName = p.PaymentDirection?.Name ?? "Unknown",
                ModeName = p.TransMode?.Name ?? "Unknown",
                Amount = p.Amount,
                IsReversed = p.IsReversed,
            }).ToList(),
            Invoices = invoices.Select(i => new ClientInvoiceSummary
            {
                InvoiceId = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                InvoiceStatusId = i.InvoiceStatusId,
                StatusName = i.InvoiceStatus?.Name ?? "Unknown",
                TotalAmount = i.TotalAmount,
            }).ToList(),
            RecentTransactions = transactions.Select(t => new ClientTransactionSummary
            {
                TransactionId = t.Id,
                TransDate = t.TransDate,
                CategoryName = t.TransCategory?.Name ?? "Unknown",
                TypeName = t.TransType?.Name ?? "Unknown",
                Amount = t.Amount,
            }).ToList(),
        };
    }
}
