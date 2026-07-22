using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Read-only reporting endpoints — profit/loss, client balances, credit/debit, summary, and client detail.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Policy = "Authenticated")]
public class ReportController : BaseController
{
    private readonly IReportService _reportService;
    private readonly IPdfService _pdfService;

    public ReportController(IReportService reportService, IPdfService pdfService)
    {
        _reportService = reportService;
        _pdfService = pdfService;
    }

    private static string Curr(decimal v) => PdfFormat.Rs(v);

    // ── Profit & Loss ────────────────────────────────────────────────────────

    /// <summary>Monthly profit and loss report. Optionally filter by year and/or month.</summary>
    [HttpGet("profit-loss")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<ProfitLossViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfitLoss([FromQuery] int? year, [FromQuery] int? month, [FromQuery] string calendar = "gregorian")
    {
        return ToActionResult(await _reportService.GetMonthlyProfitLossAsync(year, month, calendar));
    }

    /// <summary>Export profit and loss report as PDF. Accepts same year/month filters.</summary>
    [HttpGet("profit-loss/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfitLossPdf([FromQuery] int? year, [FromQuery] int? month, [FromQuery] string calendar = "gregorian")
    {
        var result = await _reportService.GetMonthlyProfitLossAsync(year, month, calendar);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var data        = result.Data;
        var periodLabel = calendar == "hijri"
            ? "Hijri — All Time"
            : (year.HasValue
                ? (month.HasValue ? $"{month.Value:D2}/{year.Value}" : year.Value.ToString())
                : "All Time");

        var totalSales     = data.Sum(r => r.TotalSales);
        var totalPurchases = data.Sum(r => r.TotalPurchases);
        var totalExpenses  = data.Sum(r => r.TotalExpenses);
        var netProfit      = data.Sum(r => r.NetProfit);

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "P&L REPORT",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = $"Profit & Loss — {periodLabel}",
            PeriodLabel         = "REPORT PERIOD",
            PeriodValue         = periodLabel,
            Stats = new()
            {
                new Stat("Total Sales",     Curr(totalSales)),
                new Stat("Total Purchases", Curr(totalPurchases)),
                new Stat("Total Expenses",  Curr(totalExpenses)),
                new Stat("Net Profit",      Curr(netProfit), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Monthly Breakdown",
                    Headers:    new[] { "#", "Month", "Sales", "Purchases", "Expenses", "Gross Profit", "Net Profit" },
                    Rows:       data.Select((r, i) => new[]
                    {
                        (i + 1).ToString(), r.Month,
                        Curr(r.TotalSales), Curr(r.TotalPurchases), Curr(r.TotalExpenses),
                        Curr(r.GrossProfit), Curr(r.NetProfit)
                    }),
                    RightAlign: new[] { 2, 3, 4, 5, 6 }),
            },
            Closing     = new ClosingSummary("NET PROFIT", $"As of {DateTime.Now:dd MMM yyyy}", "TOTAL", Curr(netProfit)),
            ClosingNote = netProfit >= 0
                ? "Business is operating at a profit. Review monthly breakdown for detailed trends."
                : "Business is operating at a loss. Please review expenses and purchasing activity.",
        };

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", $"profit-loss-{periodLabel.Replace('/', '-')}.pdf");
    }

    // ── Client Balance ───────────────────────────────────────────────────────

    /// <summary>All client balances.</summary>
    [HttpGet("client-balance")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<ClientBalanceViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientBalances()
    {
        return ToActionResult(await _reportService.GetClientBalancesAsync());
    }

    /// <summary>Single client balance by ID. Staff can access their own clients.</summary>
    [HttpGet("client-balance/{clientId:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ClientBalanceViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientBalanceById([FromRoute] int clientId)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _reportService.GetClientBalanceByIdAsync(clientId, userId, IsAdmin()));
    }

    /// <summary>Export all client balances as PDF.</summary>
    [HttpGet("client-balance/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientBalancePdf()
    {
        var result = await _reportService.GetClientBalancesAsync();
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var data            = result.Data;
        var customers       = data.Where(c => c.ClientTypeName == "Customer").ToList();
        var suppliers       = data.Where(c => c.ClientTypeName == "Supplier").ToList();
        var receivableFrom  = customers.Where(c => c.Balance > 0).Sum(c => c.Balance);
        var customerCredit  = customers.Where(c => c.Balance < 0).Sum(c => c.Balance);
        var payableTo       = suppliers.Where(c => c.Balance > 0).Sum(c => c.Balance);
        var supplierCredit  = suppliers.Where(c => c.Balance < 0).Sum(c => c.Balance);

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "CLIENT BALANCES",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = "Outstanding balances — customers and suppliers",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateTime.Now.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat($"Customers ({customers.Count})", Curr(receivableFrom)),
                new Stat($"Suppliers ({suppliers.Count})", Curr(payableTo)),
                new Stat("They Owe Us (net)",  Curr(receivableFrom + customerCredit)),
                new Stat("We Owe Them (net)",  Curr(payableTo + supplierCredit), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    $"Customers ({customers.Count}) — they owe us",
                    Headers:    new[] { "#", "Client Name", "Balance (PKR)" },
                    Rows:       customers.Select((c, i) => new[]
                    {
                        (i + 1).ToString(), c.Name, Curr(c.Balance)
                    }),
                    RightAlign: new[] { 2 }),
                new TableSection(
                    $"Suppliers ({suppliers.Count}) — we owe them",
                    Headers:    new[] { "#", "Supplier Name", "Balance (PKR)" },
                    Rows:       suppliers.Select((s, i) => new[]
                    {
                        (i + 1).ToString(), s.Name, Curr(s.Balance)
                    }),
                    RightAlign: new[] { 2 }),
            },
        };

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", "client-balances.pdf");
    }

    // ── Credit / Debit ───────────────────────────────────────────────────────

    /// <summary>Monthly credit/debit report. Optionally filter by year and/or month.</summary>
    [HttpGet("credit-debit")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<CreditDebitViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCreditDebit([FromQuery] int? year, [FromQuery] int? month, [FromQuery] string calendar = "gregorian")
    {
        return ToActionResult(await _reportService.GetMonthlyCreditDebitAsync(year, month, calendar));
    }

    /// <summary>Export credit/debit report as PDF. Accepts same year/month filters.</summary>
    [HttpGet("credit-debit/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCreditDebitPdf([FromQuery] int? year, [FromQuery] int? month, [FromQuery] string calendar = "gregorian")
    {
        var result = await _reportService.GetMonthlyCreditDebitAsync(year, month, calendar);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var data        = result.Data;
        var periodLabel = calendar == "hijri"
            ? "Hijri — All Time"
            : (year.HasValue
                ? (month.HasValue ? $"{month.Value:D2}/{year.Value}" : year.Value.ToString())
                : "All Time");

        var totalCredit = data.Sum(r => r.TotalCredit);
        var totalDebit  = data.Sum(r => r.TotalDebit);
        var netBalance  = totalCredit - totalDebit;

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "CREDIT/DEBIT",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = $"Credit/Debit Summary — {periodLabel}",
            PeriodLabel         = "REPORT PERIOD",
            PeriodValue         = periodLabel,
            Stats = new()
            {
                new Stat("Total Credit", Curr(totalCredit)),
                new Stat("Total Debit",  Curr(totalDebit)),
                new Stat("Net Balance",  Curr(netBalance), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Monthly Credit / Debit",
                    Headers:    new[] { "#", "Month", "Credit (PKR)", "Debit (PKR)", "Balance (PKR)" },
                    Rows:       data.Select((r, i) => new[]
                    {
                        (i + 1).ToString(), r.Month,
                        Curr(r.TotalCredit), Curr(r.TotalDebit), Curr(r.Balance)
                    }),
                    RightAlign: new[] { 2, 3, 4 }),
            },
            Closing = new ClosingSummary("NET BALANCE", $"As of {DateTime.Now:dd MMM yyyy}", "TOTAL", Curr(netBalance)),
        };

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", $"credit-debit-{periodLabel.Replace('/', '-')}.pdf");
    }

    // ── Summary Totals ───────────────────────────────────────────────────────

    /// <summary>Aggregate totals: sales, purchases, expenses amounts and order/purchase/client counts.</summary>
    [HttpGet("summary")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<SummaryTotalsViewModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        return ToActionResult(await _reportService.GetSummaryTotalsAsync());
    }

    /// <summary>Export summary totals as PDF.</summary>
    [HttpGet("summary/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummaryPdf()
    {
        var result = await _reportService.GetSummaryTotalsAsync();
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var d         = result.Data;
        var netProfit = d.TotalSalesAmount - d.TotalPurchasesAmount - d.TotalExpensesAmount;

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "BUSINESS SUMMARY",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = "Aggregate business overview — all time",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateTime.Now.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Total Sales",     Curr(d.TotalSalesAmount)),
                new Stat("Total Purchases", Curr(d.TotalPurchasesAmount)),
                new Stat("Total Expenses",  Curr(d.TotalExpensesAmount)),
                new Stat("Net Profit",      Curr(netProfit), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Volume Counts",
                    Headers:    new[] { "Orders", "Purchases", "Clients" },
                    Rows:       new[] { new[] { d.TotalOrderCount.ToString(), d.TotalPurchaseCount.ToString(), d.TotalClientsCount.ToString() } },
                    RightAlign: new[] { 0, 1, 2 }),
                new TableSection(
                    "Financial Totals",
                    Headers:    new[] { "Sales (PKR)", "Purchases (PKR)", "Expenses (PKR)", "Net Profit (PKR)" },
                    Rows:       new[] { new[] { Curr(d.TotalSalesAmount), Curr(d.TotalPurchasesAmount), Curr(d.TotalExpensesAmount), Curr(netProfit) } },
                    RightAlign: new[] { 0, 1, 2, 3 }),
            },
            Closing     = new ClosingSummary("NET PROFIT", $"As of {DateTime.Now:dd MMM yyyy}", "TOTAL", Curr(netProfit)),
            ClosingNote = "This is an aggregate summary. Use the P&L report for month-by-month breakdown.",
        };

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", "business-summary.pdf");
    }

    // ── Client Detail ────────────────────────────────────────────────────────

    /// <summary>Per-client breakdown with order/purchase totals, payments, recent transactions, and balance.</summary>
    [HttpGet("client-detail")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<ClientDetailViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientDetails()
    {
        return ToActionResult(await _reportService.GetClientDetailsAsync());
    }

    /// <summary>Full detail for a single client — orders, purchases, payments, recent transactions, and balance.</summary>
    [HttpGet("client-detail/{clientId:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ClientDetailViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientDetailById([FromRoute] int clientId)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _reportService.GetClientDetailByIdAsync(clientId, userId, IsAdmin()));
    }

    /// <summary>Export full single client detail as PDF with orders, purchases, payments, and transactions.</summary>
    [HttpGet("client-detail/{clientId:int}/pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientDetailByIdPdf([FromRoute] int clientId)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var result = await _reportService.GetClientDetailByIdAsync(clientId, userId, IsAdmin());
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var d = result.Data;

        // Determine period from earliest record date
        var allDates = new List<DateOnly>();
        if (d.Orders.Count > 0)    allDates.Add(d.Orders.Min(o => o.OrderDate));
        if (d.Purchases.Count > 0) allDates.Add(d.Purchases.Min(p => p.PurchaseDate));
        if (d.Payments.Count > 0)  allDates.Add(d.Payments.Min(p => p.PaymentDate));
        var from        = allDates.Count > 0 ? allDates.Min() : DateOnly.FromDateTime(DateTime.Now);
        var periodValue = $"{from:dd MMM yyyy} — {DateTime.Now:dd MMM yyyy}";

        var isCustomer = d.ClientTypeName == "Customer";

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = isCustomer ? "CLIENT STATEMENT" : "SUPPLIER STATEMENT",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = d.ClientName,
            PreparedForSubtitle = isCustomer
                ? $"Customer · Account #{d.ClientId} — They owe us"
                : $"Supplier · Account #{d.ClientId} — We owe them",
            PeriodLabel         = "ACCOUNT PERIOD",
            PeriodValue         = periodValue,
            Stats = isCustomer
                ? new()
                {
                    new Stat($"Orders ({d.TotalOrderCount})", Curr(d.TotalOrderAmount)),
                    new Stat("Payments Received",              Curr(d.TotalPaymentsIn)),
                    new Stat("Payments Refunded",              Curr(d.TotalPaymentsOut)),
                    new Stat("Amount Due",                     Curr(d.Balance), Highlight: true),
                }
                : new()
                {
                    new Stat($"Purchases ({d.TotalPurchaseCount})", Curr(d.TotalPurchaseAmount)),
                    new Stat("Payments Made",                        Curr(d.TotalPaymentsOut)),
                    new Stat("Payments Received Back",               Curr(d.TotalPaymentsIn)),
                    new Stat("Amount Payable",                       Curr(d.Balance), Highlight: true),
                },
            Sections = new(),
        };

        if (d.Orders.Count > 0)
            model.Sections.Add(new TableSection(
                $"Orders ({d.Orders.Count})",
                Headers:    new[] { "#", "Date", "Status", "Total", "Paid", "Outstanding", "Payment" },
                Rows:       d.Orders.Select((o, i) => new[]
                {
                    (i + 1).ToString(), o.OrderDate.ToString("dd MMM yyyy"), o.StatusName,
                    Curr(o.Total), Curr(o.AmountPaid), Curr(o.Outstanding), o.PaymentStatus
                }),
                RightAlign: new[] { 3, 4, 5 }));

        if (d.Purchases.Count > 0)
            model.Sections.Add(new TableSection(
                $"Purchases ({d.Purchases.Count})",
                Headers:    new[] { "#", "Date", "Status", "Total", "Paid", "Outstanding", "Payment" },
                Rows:       d.Purchases.Select((p, i) => new[]
                {
                    (i + 1).ToString(), p.PurchaseDate.ToString("dd MMM yyyy"), p.StatusName,
                    Curr(p.Total), Curr(p.AmountPaid), Curr(p.Outstanding), p.PaymentStatus
                }),
                RightAlign: new[] { 3, 4, 5 }));

        if (d.Payments.Count > 0)
            model.Sections.Add(new TableSection(
                $"Payments ({d.Payments.Count})",
                Headers:    new[] { "#", "Date", "Direction", "Mode", "Amount" },
                Rows:       d.Payments.Select((p, i) => new[]
                {
                    (i + 1).ToString(), p.PaymentDate.ToString("dd MMM yyyy"),
                    p.DirectionName, p.ModeName, Curr(p.Amount)
                }),
                RightAlign: new[] { 4 }));

        if (d.RecentTransactions.Count > 0)
            model.Sections.Add(new TableSection(
                $"Recent Transactions ({d.RecentTransactions.Count})",
                Headers:    new[] { "#", "Date", "Category", "Type", "Amount" },
                Rows:       d.RecentTransactions.Select((t, i) => new[]
                {
                    (i + 1).ToString(), t.TransDate.ToString("dd MMM yyyy"),
                    t.CategoryName, t.TypeName, Curr(t.Amount)
                }),
                RightAlign: new[] { 4 }));

        model.Closing = new ClosingSummary(
            "CLOSING BALANCE", $"As of {DateTime.Now:dd MMM yyyy}",
            isCustomer ? "AMOUNT DUE" : "AMOUNT PAYABLE", Curr(d.Balance));
        model.ClosingNote = "Thank you for your continued partnership with Hamza Tex. For queries, please contact us at hamzatex007@gmail.com.";

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", $"client-statement-{d.ClientName.Replace(' ', '-')}.pdf");
    }

    /// <summary>Export per-client overview — all clients with order, purchase, and balance totals.</summary>
    [HttpGet("client-detail/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientDetailPdf()
    {
        var result = await _reportService.GetClientDetailsAsync();
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var data             = result.Data;
        var customers        = data.Where(c => c.ClientTypeName == "Customer").ToList();
        var suppliers        = data.Where(c => c.ClientTypeName == "Supplier").ToList();
        var totalOrderVal    = customers.Sum(c => c.TotalOrderAmount);
        var totalPurchaseVal = suppliers.Sum(c => c.TotalPurchaseAmount);
        var receivable       = customers.Sum(c => c.Balance);
        var payable          = suppliers.Sum(c => c.Balance);

        var sections = new List<TableSection>();

        if (customers.Count > 0)
            sections.Add(new TableSection(
                $"Customers ({customers.Count})",
                Headers:    new[] { "#", "Client", "Orders", "Order Total", "Balance" },
                Rows:       customers.Select((c, i) => new[]
                {
                    (i + 1).ToString(), c.ClientName,
                    c.TotalOrderCount.ToString(), Curr(c.TotalOrderAmount),
                    Curr(c.Balance)
                }),
                RightAlign: new[] { 3, 4 }));

        if (suppliers.Count > 0)
            sections.Add(new TableSection(
                $"Suppliers ({suppliers.Count})",
                Headers:    new[] { "#", "Supplier", "Purchases", "Purchase Total", "Balance" },
                Rows:       suppliers.Select((s, i) => new[]
                {
                    (i + 1).ToString(), s.ClientName,
                    s.TotalPurchaseCount.ToString(), Curr(s.TotalPurchaseAmount),
                    Curr(s.Balance)
                }),
                RightAlign: new[] { 3, 4 }));

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "CLIENT DETAIL",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = "Per-client orders, purchases, and balance overview",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateTime.Now.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat($"Customers ({customers.Count})", Curr(receivable)),
                new Stat($"Suppliers ({suppliers.Count})", Curr(payable)),
                new Stat("They Owe Us (net)", Curr(receivable)),
                new Stat("We Owe Them (net)", Curr(payable), Highlight: true),
            },
            Sections = sections,
        };

        var pdf = _pdfService.CreateDocument(model);
        return File(pdf, "application/pdf", "client-detail.pdf");
    }
}
