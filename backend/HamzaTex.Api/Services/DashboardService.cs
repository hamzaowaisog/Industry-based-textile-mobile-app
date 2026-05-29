using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Role-scoped dashboard aggregation service.</summary>
public interface IDashboardService
{
    /// <summary>Dashboard summary: financials, operations, alerts, recent orders.</summary>
    Task<Response<DashboardSummaryDto>> GetSummaryAsync(int userId, bool isAdmin);

    /// <summary>Last N months of aggregated financials for charts.</summary>
    Task<Response<MonthlyOverviewDto>> GetMonthlyOverviewAsync(int userId, bool isAdmin, int months = 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _db;

    public DashboardService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Response<DashboardSummaryDto>> GetSummaryAsync(int userId, bool isAdmin)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentMonthStart = new DateOnly(today.Year, today.Month, 1);
        var nextMonthStart = currentMonthStart.AddMonths(1);
        var lastMonthStart = currentMonthStart.AddMonths(-1);

        // ── Financials: single grouped query with conditional sums ──────────
        var fin = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransDate >= currentMonthStart && t.TransDate < nextMonthStart)
            .Where(t => isAdmin || t.UserId == userId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Revenue = g.Sum(t => t.TransCategoryId == 1 ? t.Amount : 0m),
                Purchases = g.Sum(t => t.TransCategoryId == 2 ? t.Amount : 0m),
                Expenses = g.Sum(t => (t.TransCategoryId == 3 || t.TransCategoryId == 4) ? t.Amount : 0m)
            })
            .FirstOrDefaultAsync();

        var thisMonthRevenue = fin?.Revenue ?? 0m;
        var thisMonthPurchases = fin?.Purchases ?? 0m;
        var thisMonthExpenses = fin?.Expenses ?? 0m;

        var lastMonthRevenue = await _db.Transactions.AsNoTracking()
            .Where(t => t.TransDate >= lastMonthStart && t.TransDate < currentMonthStart)
            .Where(t => t.TransCategoryId == 1)
            .Where(t => isAdmin || t.UserId == userId)
            .SumAsync(t => t.Amount);

        // ── Total Outstanding ───────────────────────────────────────────────
        decimal totalOutstanding;
        if (isAdmin)
        {
            totalOutstanding = await _db.VClientBalances.AsNoTracking()
                .Where(b => b.Balance > 0)
                .SumAsync(b => b.Balance ?? 0m);
        }
        else
        {
            var clientIds = await _db.Clients.AsNoTracking()
                .Where(c => c.UserId == userId)
                .Select(c => c.Id)
                .ToListAsync();

            totalOutstanding = clientIds.Count > 0
                ? await _db.VClientBalances.AsNoTracking()
                    .Where(b => b.ClientId != null && clientIds.Contains(b.ClientId.Value) && b.Balance > 0)
                    .SumAsync(b => b.Balance ?? 0m)
                : 0m;
        }

        // ── Operations ──────────────────────────────────────────────────────
        var todayOrdersRaw = await _db.Orders.AsNoTracking()
            .Where(o => o.OrderDate == today)
            .Where(o => isAdmin || o.Client.UserId == userId)
            .Include(o => o.OrderLines)
            .ToListAsync();

        var todayOrdersCount = todayOrdersRaw.Count;
        var todayOrdersTotal = todayOrdersRaw
            .Sum(o => o.OrderLines.Sum(ol => ol.Qty * ol.UnitPrice));

        var pendingOrdersCount = await _db.Orders.AsNoTracking()
            .Where(o => o.StatusId == 1 || o.StatusId == 2)
            .Where(o => isAdmin || o.Client.UserId == userId)
            .CountAsync();

        var unallocatedPaymentsCount = await _db.Payments.AsNoTracking()
            .Where(p => !p.IsReversed)
            .Where(p => isAdmin || p.PartyClient.UserId == userId)
            .Where(p => !p.Allocations.Any())
            .CountAsync();

        // ── Alerts ──────────────────────────────────────────────────────────
        var lowStockCount = await _db.Products.AsNoTracking()
            .Where(p => isAdmin || p.ProductUsers.Any(pu => pu.UserId == userId))
            .CountAsync(p => p.Quantity <= p.ReorderLevel);

        var overdueInvoicesCount = await _db.Invoices.AsNoTracking()
            .Where(i => i.DueDate < today && i.InvoiceStatusId == 2)
            .Where(i => isAdmin || i.CreatedByUserId == userId)
            .CountAsync();

        // ── Recent Orders ───────────────────────────────────────────────────
        var recentOrdersRaw = await _db.Orders.AsNoTracking()
            .Where(o => isAdmin || o.Client.UserId == userId)
            .Include(o => o.Client)
            .Include(o => o.OrderLines)
            .Include(o => o.Status)
            .OrderByDescending(o => o.OrderDate)
            .ThenByDescending(o => o.Id)
            .Take(5)
            .ToListAsync();

        var recentOrders = recentOrdersRaw.Select(o => new RecentOrderDto
        {
            OrderId = o.Id,
            ClientName = o.Client?.Name ?? string.Empty,
            Total = o.OrderLines.Sum(ol => ol.Qty * ol.UnitPrice),
            StatusName = o.Status?.Name ?? string.Empty,
            OrderDate = o.OrderDate.ToString("dd MMM, yyyy")
        }).ToList();

        // ── Build response ──────────────────────────────────────────────────
        var dto = new DashboardSummaryDto
        {
            AsOf = today.ToString("dd MMM, yyyy"),
            Financials = new DashboardFinancialsDto
            {
                ThisMonthRevenue = thisMonthRevenue,
                LastMonthRevenue = lastMonthRevenue,
                ThisMonthPurchases = thisMonthPurchases,
                ThisMonthExpenses = thisMonthExpenses,
                ThisMonthNetProfit = thisMonthRevenue - thisMonthPurchases - thisMonthExpenses,
                TotalOutstanding = totalOutstanding
            },
            Operations = new DashboardOperationsDto
            {
                TodayOrdersCount = todayOrdersCount,
                TodayOrdersTotal = todayOrdersTotal,
                PendingOrdersCount = pendingOrdersCount,
                UnallocatedPaymentsCount = unallocatedPaymentsCount
            },
            Alerts = new DashboardAlertsDto
            {
                LowStockCount = lowStockCount,
                OverdueInvoicesCount = overdueInvoicesCount
            },
            RecentOrders = recentOrders
        };

        return Response<DashboardSummaryDto>.SuccessResponse(dto, "Dashboard summary");
    }

    public async Task<Response<MonthlyOverviewDto>> GetMonthlyOverviewAsync(int userId, bool isAdmin, int months = 6)
    {
        months = Math.Clamp(months, 1, 12);
        var utcNow = DateTime.UtcNow;
        var cutoffStart = new DateTime(utcNow.Year, utcNow.Month, 1).AddMonths(-(months - 1));

        List<MonthlyOverviewItemDto> monthItems;

        if (isAdmin)
        {
            var viewData = await _db.VMonthlyProfitLosses.AsNoTracking()
                .Where(v => v.Month >= cutoffStart)
                .OrderBy(v => v.Month)
                .ToListAsync();

            monthItems = viewData.Select(v => new MonthlyOverviewItemDto
            {
                Month = v.Month?.ToString("MMM yyyy") ?? string.Empty,
                TotalSales = v.TotalSales ?? 0m,
                TotalPurchases = v.TotalPurchases ?? 0m,
                TotalExpenses = v.TotalExpenses ?? 0m,
                NetProfit = v.NetProfit ?? 0m
            }).ToList();
        }
        else
        {
            var today = DateOnly.FromDateTime(utcNow);
            var staffCutoff = new DateOnly(today.Year, today.Month, 1).AddMonths(-(months - 1));

            var rawMonthly = await _db.Transactions.AsNoTracking()
                .Where(t => t.UserId == userId && t.TransDate >= staffCutoff)
                .GroupBy(t => new { t.TransDate.Year, t.TransDate.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    TotalSales = g.Sum(t => t.TransCategoryId == 1 ? t.Amount : 0m),
                    TotalPurchases = g.Sum(t => t.TransCategoryId == 2 ? t.Amount : 0m),
                    TotalExpenses = g.Sum(t => (t.TransCategoryId == 3 || t.TransCategoryId == 4) ? t.Amount : 0m)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            monthItems = rawMonthly.Select(x => new MonthlyOverviewItemDto
            {
                Month = new DateTime(x.Year, x.Month, 1).ToString("MMM yyyy"),
                TotalSales = x.TotalSales,
                TotalPurchases = x.TotalPurchases,
                TotalExpenses = x.TotalExpenses,
                NetProfit = x.TotalSales - x.TotalPurchases - x.TotalExpenses
            }).ToList();
        }

        return Response<MonthlyOverviewDto>.SuccessResponse(
            new MonthlyOverviewDto { Months = monthItems }, "Monthly overview");
    }
}
