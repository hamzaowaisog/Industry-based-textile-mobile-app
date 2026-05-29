namespace HamzaTex.Api.Models;

public class DashboardFinancialsDto
{
    public decimal ThisMonthRevenue { get; set; }
    public decimal LastMonthRevenue { get; set; }
    public decimal ThisMonthPurchases { get; set; }
    public decimal ThisMonthExpenses { get; set; }
    public decimal ThisMonthNetProfit { get; set; }
    public decimal TotalOutstanding { get; set; }
}

public class DashboardOperationsDto
{
    public int TodayOrdersCount { get; set; }
    public decimal TodayOrdersTotal { get; set; }
    public int PendingOrdersCount { get; set; }
    public int UnallocatedPaymentsCount { get; set; }
}

public class DashboardAlertsDto
{
    public int LowStockCount { get; set; }
    public int OverdueInvoicesCount { get; set; }
}

public class RecentOrderDto
{
    public int OrderId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string OrderDate { get; set; } = string.Empty;
}

public class DashboardSummaryDto
{
    public string AsOf { get; set; } = string.Empty;
    public string Currency { get; set; } = "PKR";
    public DashboardFinancialsDto Financials { get; set; } = new();
    public DashboardOperationsDto Operations { get; set; } = new();
    public DashboardAlertsDto Alerts { get; set; } = new();
    public List<RecentOrderDto> RecentOrders { get; set; } = [];
}

public class MonthlyOverviewItemDto
{
    public string Month { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
}

public class MonthlyOverviewDto
{
    public List<MonthlyOverviewItemDto> Months { get; set; } = [];
}
