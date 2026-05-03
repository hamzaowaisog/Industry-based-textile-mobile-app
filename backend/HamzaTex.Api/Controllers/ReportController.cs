using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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

    private bool IsAdmin()
    {
        var roleId = User.FindFirst("RoleId")?.Value;
        return roleId == "1";
    }

    // ── Profit & Loss ────────────────────────────────────────────────────────

    /// <summary>Monthly profit and loss report. Optionally filter by year and/or month.</summary>
    [HttpGet("profit-loss")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<ProfitLossViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfitLoss([FromQuery] int? year, [FromQuery] int? month)
    {
        return ToActionResult(await _reportService.GetMonthlyProfitLossAsync(year, month));
    }

    /// <summary>Export profit and loss report as PDF. Accepts same year/month filters.</summary>
    [HttpGet("profit-loss/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfitLossPdf([FromQuery] int? year, [FromQuery] int? month)
    {
        var result = await _reportService.GetMonthlyProfitLossAsync(year, month);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var label = year.HasValue ? $"P&L Report — {(month.HasValue ? $"{month.Value}/{year.Value}" : year.Value.ToString())}" : "P&L Report — All Time";
        var pdf = _pdfService.CreatePdf("Profit & Loss", label, result.Data, EntityPdfConfigs.ProfitLoss, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "profit-loss.pdf");
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
        return ToActionResult(await _reportService.GetClientBalanceByIdAsync(clientId));
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

        var pdf = _pdfService.CreatePdf("Client Balances", "Outstanding balances for all clients. Amounts in PKR.", result.Data, EntityPdfConfigs.ClientBalance, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "client-balances.pdf");
    }

    // ── Credit / Debit ───────────────────────────────────────────────────────

    /// <summary>Monthly credit/debit report. Optionally filter by year and/or month.</summary>
    [HttpGet("credit-debit")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<CreditDebitViewModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCreditDebit([FromQuery] int? year, [FromQuery] int? month)
    {
        return ToActionResult(await _reportService.GetMonthlyCreditDebitAsync(year, month));
    }

    /// <summary>Export credit/debit report as PDF. Accepts same year/month filters.</summary>
    [HttpGet("credit-debit/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCreditDebitPdf([FromQuery] int? year, [FromQuery] int? month)
    {
        var result = await _reportService.GetMonthlyCreditDebitAsync(year, month);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var label = year.HasValue ? $"Credit/Debit — {(month.HasValue ? $"{month.Value}/{year.Value}" : year.Value.ToString())}" : "Credit/Debit — All Time";
        var pdf = _pdfService.CreatePdf("Credit / Debit", label, result.Data, EntityPdfConfigs.CreditDebit, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "credit-debit.pdf");
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

        var list = new List<SummaryTotalsViewModel> { result.Data };
        var pdf = _pdfService.CreatePdf("Summary Totals", "Aggregate business overview. All amounts in PKR.", list, EntityPdfConfigs.SummaryTotals, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "summary.pdf");
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
        return ToActionResult(await _reportService.GetClientDetailByIdAsync(clientId));
    }

    /// <summary>Export full single client detail as PDF with orders, purchases, payments, and transactions.</summary>
    [HttpGet("client-detail/{clientId:int}/pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientDetailByIdPdf([FromRoute] int clientId)
    {
        var result = await _reportService.GetClientDetailByIdAsync(clientId);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var d = result.Data;
        var reportDate = DateTime.Now.ToString("dd MMM yyyy");
        var reportRef = $"HT-{DateTime.Now:yyyyMMdd-HHmm}";
        var pkCulture = new System.Globalization.CultureInfo("en-PK");
        string Curr(decimal v) => v.ToString("C", pkCulture);

        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor("#0f172a"));

                // ── HEADER ────────────────────────────────────────────
                page.Header().Column(h =>
                {
                    h.Item().Background("#0f172a").Padding(16).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Hamza Tex").Bold().FontSize(20).FontColor(Colors.White);
                            col.Item().PaddingTop(4).Text("Client Detail Report").FontSize(10).FontColor("#a5f3fc").Italic();
                        });
                        row.ConstantItem(130).AlignRight().Column(col =>
                        {
                            col.Item().AlignRight().Text(reportDate).Bold().FontSize(10).FontColor(Colors.White);
                            col.Item().PaddingTop(3).AlignRight().Text($"Ref: {reportRef}").FontSize(8).FontColor("#94a3b8");
                        });
                    });
                    h.Item().Height(4).Background("#0891b2");
                    h.Item().Height(8);
                });

                // ── CONTENT ───────────────────────────────────────────
                page.Content().PaddingVertical(6).Column(column =>
                {
                    // Client summary card
                    column.Item().Background("#f0f9ff").Border(1).BorderColor("#7dd3fc").Padding(14).Column(c =>
                    {
                        c.Item().Text($"{d.ClientName}  ({d.ClientTypeName})").Bold().FontSize(14).FontColor("#0f172a");
                        c.Item().PaddingTop(8).Row(r =>
                        {
                            r.RelativeItem().Text($"Orders: {d.TotalOrderCount}  ({Curr(d.TotalOrderAmount)})").FontSize(9);
                            r.RelativeItem().Text($"Purchases: {d.TotalPurchaseCount}  ({Curr(d.TotalPurchaseAmount)})").FontSize(9);
                            r.RelativeItem().Text($"Payments In: {Curr(d.TotalPaymentsIn)}").FontSize(9);
                        });
                        c.Item().PaddingTop(4).Row(r =>
                        {
                            r.RelativeItem().Text($"Payments Out: {Curr(d.TotalPaymentsOut)}").FontSize(9);
                            r.RelativeItem().Text($"Outstanding: {Curr(d.Outstanding)}").FontSize(9).Bold().FontColor("#dc2626");
                            r.RelativeItem().Text($"Balance: {Curr(d.Balance)}").FontSize(9).Bold();
                        });
                    });
                    column.Item().PaddingTop(10);

                    // Orders section
                    if (d.Orders.Count > 0)
                    {
                        column.Item().Text("Orders").Bold().FontSize(11).FontColor("#0891b2");
                        column.Item().PaddingTop(4).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.ConstantColumn(60); c.ConstantColumn(80); c.ConstantColumn(70); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.ConstantColumn(90); });
                            t.Header(h =>
                            {
                                void Hdr(string v) { h.Cell().Background("#0f172a").BorderBottom(2).BorderColor("#0891b2").Padding(6).Text(v).Bold().FontSize(8).FontColor(Colors.White); }
                                Hdr("Order #"); Hdr("Date"); Hdr("Status"); Hdr("Total (PKR)"); Hdr("Paid (PKR)"); Hdr("Outstanding"); Hdr("Payment");
                            });
                            var orderIdx = 0;
                            foreach (var o in d.Orders)
                            {
                                orderIdx++;
                                void Cell(string v) { t.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(6).Text(v).FontSize(8); }
                                Cell($"#{orderIdx}"); Cell(o.OrderDate.ToString("dd MMM yyyy")); Cell(o.StatusName);
                                Cell(Curr(o.Total)); Cell(Curr(o.AmountPaid)); Cell(Curr(o.Outstanding)); Cell(o.PaymentStatus);
                            }
                        });
                        column.Item().PaddingTop(10);
                    }

                    // Purchases section
                    if (d.Purchases.Count > 0)
                    {
                        column.Item().Text("Purchases").Bold().FontSize(11).FontColor("#0891b2");
                        column.Item().PaddingTop(4).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.ConstantColumn(70); c.ConstantColumn(80); c.ConstantColumn(70); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); c.ConstantColumn(90); });
                            t.Header(h =>
                            {
                                void Hdr(string v) { h.Cell().Background("#0f172a").BorderBottom(2).BorderColor("#0891b2").Padding(6).Text(v).Bold().FontSize(8).FontColor(Colors.White); }
                                Hdr("Purchase #"); Hdr("Date"); Hdr("Status"); Hdr("Total (PKR)"); Hdr("Paid (PKR)"); Hdr("Outstanding"); Hdr("Payment");
                            });
                            var purchaseIdx = 0;
                            foreach (var p in d.Purchases)
                            {
                                purchaseIdx++;
                                void Cell(string v) { t.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(6).Text(v).FontSize(8); }
                                Cell($"#{purchaseIdx}"); Cell(p.PurchaseDate.ToString("dd MMM yyyy")); Cell(p.StatusName);
                                Cell(Curr(p.Total)); Cell(Curr(p.AmountPaid)); Cell(Curr(p.Outstanding)); Cell(p.PaymentStatus);
                            }
                        });
                        column.Item().PaddingTop(10);
                    }

                    // Payments section
                    if (d.Payments.Count > 0)
                    {
                        column.Item().Text("Payments").Bold().FontSize(11).FontColor("#0891b2");
                        column.Item().PaddingTop(4).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.ConstantColumn(70); c.ConstantColumn(80); c.RelativeColumn(); c.RelativeColumn(); c.ConstantColumn(80); });
                            t.Header(h =>
                            {
                                void Hdr(string v) { h.Cell().Background("#0f172a").BorderBottom(2).BorderColor("#0891b2").Padding(6).Text(v).Bold().FontSize(8).FontColor(Colors.White); }
                                Hdr("Payment #"); Hdr("Date"); Hdr("Direction"); Hdr("Mode"); Hdr("Amount");
                            });
                            var paymentIdx = 0;
                            foreach (var p in d.Payments)
                            {
                                paymentIdx++;
                                void Cell(string v) { t.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(6).Text(v).FontSize(8); }
                                Cell($"#{paymentIdx}"); Cell(p.PaymentDate.ToString("dd MMM yyyy")); Cell(p.DirectionName);
                                Cell(p.ModeName); Cell(Curr(p.Amount));
                            }
                        });
                        column.Item().PaddingTop(10);
                    }

                    // Recent transactions section
                    if (d.RecentTransactions.Count > 0)
                    {
                        column.Item().Text("Recent Transactions").Bold().FontSize(11).FontColor("#0891b2");
                        column.Item().PaddingTop(4).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.ConstantColumn(80); c.ConstantColumn(80); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                            t.Header(h =>
                            {
                                void Hdr(string v) { h.Cell().Background("#0f172a").BorderBottom(2).BorderColor("#0891b2").Padding(6).Text(v).Bold().FontSize(8).FontColor(Colors.White); }
                                Hdr("Trans #"); Hdr("Date"); Hdr("Category"); Hdr("Type"); Hdr("Amount");
                            });
                            var txIdx = 0;
                            foreach (var tx in d.RecentTransactions)
                            {
                                txIdx++;
                                void Cell(string v) { t.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(6).Text(v).FontSize(8); }
                                Cell($"#{txIdx}"); Cell(tx.TransDate.ToString("dd MMM yyyy")); Cell(tx.CategoryName);
                                Cell(tx.TypeName); Cell(Curr(tx.Amount));
                            }
                        });
                    }

                    // Footer
                    column.Item().PaddingTop(14).Background("#1e293b").Padding(10)
                        .Text($"{d.Orders.Count + d.Purchases.Count + d.Payments.Count + d.RecentTransactions.Count} records — end of report")
                        .FontSize(8).FontColor("#94a3b8").Italic();
                });

                // ── FOOTER ────────────────────────────────────────────
                page.Footer().Column(f =>
                {
                    f.Item().Height(3).Background("#0891b2");
                    f.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text("Hamza Tex — Confidential").FontSize(8).FontColor("#94a3b8").Italic();
                        row.ConstantItem(80).AlignRight().Text(text =>
                        {
                            text.Span("Page ").FontSize(8).FontColor("#94a3b8");
                            text.CurrentPageNumber().FontSize(8).FontColor("#475569").Bold();
                            text.Span(" / ").FontSize(8).FontColor("#94a3b8");
                            text.TotalPages().FontSize(8).FontColor("#475569");
                        });
                    });
                });
            });
        });

        var pdf = document.GeneratePdf();
        return File(pdf, "application/pdf", $"client-detail-{d.ClientName.Replace(' ', '-')}.pdf");
    }

    /// <summary>Export per-client detail report as PDF.</summary>
    [HttpGet("client-detail/pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientDetailPdf()
    {
        var result = await _reportService.GetClientDetailsAsync();
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var pdf = _pdfService.CreatePdf("Client Detail Report", "Per-client orders, purchases, and balance. All amounts in PKR.", result.Data, EntityPdfConfigs.ClientDetail, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "client-detail.pdf");
    }
}
