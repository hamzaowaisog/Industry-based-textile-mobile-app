using System.Globalization;
using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Invoice management — CRUD, lifecycle, rich query, and PDF exports.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class InvoiceController : BaseController
{
    private readonly IInvoiceService _invoiceService;
    private readonly IPdfService _pdfService;

    public InvoiceController(IInvoiceService invoiceService, IPdfService pdfService)
    {
        _invoiceService = invoiceService;
        _pdfService = pdfService;
    }

    /// <summary>Create a standalone invoice.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] InvoiceCreateViewModel model)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new CreateInvoiceDto
        {
            OrderId     = model.OrderId,
            PurchaseId  = model.PurchaseId,
            ClientId    = model.ClientId,
            DueDate     = model.DueDate,
            DueDateHijri = model.DueDateHijri,
            TotalAmount = model.TotalAmount,
            Notes       = model.Notes,
            Lines       = model.Lines.Select(l => new CreateInvoiceLineDto
            {
                ProductName = l.ProductName,
                Qty         = l.Qty,
                UnitPrice   = l.UnitPrice,
            }).ToList(),
        };

        return ToActionResult(await _invoiceService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Get all invoices paginated. Admin sees all; staff see invoices they created.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PagedList<InvoiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _invoiceService.GetAllPaginatedAsync(page, pageSize, userId, IsAdmin()));
    }

    /// <summary>Get aggregate receivable/payable totals (excluding cancelled invoices) and total count across the full invoice set, independent of pagination. Admin sees all; staff see invoices they created.</summary>
    [HttpGet("summary")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<InvoiceSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _invoiceService.GetSummaryAsync(userId, IsAdmin()));
    }

    /// <summary>Get a single invoice with lines and linked transactions. Admin can access any invoice; non-admins only invoices they created.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<InvoiceDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _invoiceService.GetByIdAsync(id, userId, IsAdmin()));
    }

    /// <summary>Get all invoices for a client with aggregate stats. Admin sees all; non-admins see only invoices they created.</summary>
    [HttpGet("by-client/{clientId:int}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<InvoiceByClientDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByClient([FromRoute] int clientId)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _invoiceService.GetAllByClientIdAsync(clientId, userId, IsAdmin()));
    }

    /// <summary>Filter invoices by statusId, clientId, dateFrom, dateTo. Admin sees all matches; non-admins see only invoices they created.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<InvoiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? statusId,
        [FromQuery] int? clientId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _invoiceService.GetFilteredAsync(statusId, clientId, dateFrom, dateTo, userId, IsAdmin()));
    }

    /// <summary>Update invoice status, dueDate, notes, totalAmount, and/or lines.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] InvoiceUpdateViewModel model)
    {
        var dto = new UpdateInvoiceDto
        {
            InvoiceStatusId = model.InvoiceStatusId,
            DueDate         = model.DueDate,
            Notes           = model.Notes,
            TotalAmount     = model.TotalAmount,
            Lines           = model.Lines?.Select(l => new CreateInvoiceLineDto
            {
                ProductName = l.ProductName,
                Qty         = l.Qty,
                UnitPrice   = l.UnitPrice,
            }).ToList(),
        };

        return ToActionResult(await _invoiceService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Delete a Draft invoice created within the last year. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
        => ToActionResult(await _invoiceService.DeleteByIdAsync(id));

    /// <summary>Export all invoices as a branded PDF with stat cards.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPdf([FromQuery] int page = 1, [FromQuery] int pageSize = 10000)
    {
        var userId = GetUserId() ?? 0;
        var result = await _invoiceService.GetAllPaginatedAsync(page, pageSize, userId, true);
        if (!result.Success || result.Data is null) return BadRequest(result.Message);

        var data        = result.Data.Items;
        var totalAmount = data.Sum(i => i.TotalAmount);
        var totalPaid   = data.Sum(i => i.AmountPaid);
        var totalOst    = data.Sum(i => i.Outstanding);
        var receivable  = data.Where(i => i.Direction == "Receivable").Sum(i => i.Outstanding);
        var payable     = data.Where(i => i.Direction == "Payable").Sum(i => i.Outstanding);
        var salesTotal  = data.Where(i => i.Type == "Order").Sum(i => i.TotalAmount);
        var purchTotal  = data.Where(i => i.Type == "Purchase").Sum(i => i.TotalAmount);

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "INVOICES",
            Reference           = $"HT-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = $"All Invoices — as of {DateOnly.FromDateTime(DateTime.UtcNow):dd MMM, yyyy}",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateOnly.FromDateTime(DateTime.UtcNow).ToString("dd MMM, yyyy"),
            Stats = new()
            {
                new Stat("Sales Invoices (Receivable)",  Curr(salesTotal)),
                new Stat("Purchase Invoices (Payable)",   Curr(purchTotal)),
                new Stat("Receivable (Owed to Us)",       Curr(receivable), Highlight: true),
                new Stat("Payable (We Owe)",              Curr(payable)),
            },
            Sections = new()
            {
                new TableSection(
                    "Invoice List",
                    Headers:    new[] { "#", "Invoice #", "Bill No", "Client", "Direction", "Status", "Total", "Paid", "Outstanding", "Issue Date" },
                    RightAlign: new[] { 6, 7, 8 },
                    Rows:       data.Select((i, idx) => new[]
                    {
                        (idx + 1).ToString(), i.InvoiceNumber, i.BillNo ?? "—", i.ClientName, i.Direction, i.StatusName,
                        Curr(i.TotalAmount), Curr(i.AmountPaid), Curr(i.Outstanding),
                        i.IssueDate?.ToString("dd MMM, yyyy") ?? "-"
                    })),
            },
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", "invoices.pdf");
    }

    /// <summary>Export a single invoice as a formal branded PDF.</summary>
    [HttpGet("{id:int}/pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdPdf([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var result = await _invoiceService.GetByIdAsync(id, userId, IsAdmin());
        if (!result.Success || result.Data is null) return NotFound(result.Message);

        var inv = result.Data;

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "INVOICE",
            Reference           = inv.InvoiceNumber,
            IssuedDate          = DateTime.Now,
            PreparedFor         = inv.ClientName,
            PreparedForSubtitle = $"Type: {inv.Type} · Status: {inv.StatusName}",
            PeriodLabel         = "ISSUE DATE",
            PeriodValue         = inv.IssueDate?.ToString("dd MMM, yyyy") ?? "Pending",
            Stats = new()
            {
                new Stat("Total Amount",                                Curr(inv.TotalAmount)),
                new Stat(inv.Direction == "Receivable" ? "Received" : "Paid",  Curr(inv.AmountPaid)),
                new Stat(inv.Direction == "Receivable" ? "Receivable (Owed to Us)" : "Payable (We Owe)", Curr(inv.Outstanding), Highlight: true),
                new Stat("Bill No",       inv.BillNo ?? "—"),
                new Stat("Due Date",      inv.DueDate?.ToString("dd MMM, yyyy") ?? "N/A"),
            },
            Sections = new()
            {
                new TableSection(
                    "Line Items",
                    Headers:    new[] { "#", "Product", "Qty", "Unit Price", "Line Total" },
                    RightAlign: new[] { 3, 4 },
                    Rows:       inv.Lines.Select((l, i) => new[]
                    {
                        (i + 1).ToString(), l.ProductName,
                        l.Qty.ToString("0.##"), Curr(l.UnitPrice), Curr(l.LineTotal)
                    })),
                new TableSection(
                    "Linked Transactions",
                    Headers:    new[] { "#", "Date", "Category", "Type", "Amount" },
                    RightAlign: new[] { 4 },
                    Rows:       inv.LinkedTransactions.Select((t, i) => new[]
                    {
                        (i + 1).ToString(),
                        t.TransDate.ToString("dd MMM, yyyy"),
                        t.CategoryName, t.TypeName, Curr(t.Amount)
                    })),
            },
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"{inv.InvoiceNumber}.pdf");
    }

    /// <summary>Export all invoices for a client as a PDF with aggregate stat cards.</summary>
    [HttpGet("by-client/{clientId:int}/pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByClientPdf([FromRoute] int clientId)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var result = await _invoiceService.GetAllByClientIdAsync(clientId, userId, IsAdmin());
        if (!result.Success || result.Data is null) return NotFound(result.Message);

        var data = result.Data;

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "CLIENT INVOICES",
            Reference           = $"HT-CLIENT-{clientId:D4}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = data.ClientName,
            PreparedForSubtitle = $"{data.ClientTypeName} · Client ID: {data.ClientId}",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateOnly.FromDateTime(DateTime.UtcNow).ToString("dd MMM, yyyy"),
            Stats = new()
            {
                new Stat("Total Invoiced",                                              Curr(data.TotalInvoiced)),
                new Stat(data.Direction == "Receivable" ? "Total Received" : "Total Paid", Curr(data.TotalPaid)),
                new Stat(data.Direction == "Receivable" ? "Receivable (Owed to Us)" : "Payable (We Owe)", data.Direction == "Receivable" ? Curr(data.TotalReceivable) : Curr(data.TotalPayable), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Invoice Summary",
                    Headers:    new[] { "#", "Invoice #", "Bill No", "Direction", "Status", "Total", "Paid", "Outstanding", "Issue Date", "Due Date" },
                    RightAlign: new[] { 5, 6, 7 },
                    Rows:       data.Invoices.Select((i, idx) => new[]
                    {
                        (idx + 1).ToString(), i.InvoiceNumber, i.BillNo ?? "—", i.Direction, i.StatusName,
                        Curr(i.TotalAmount), Curr(i.AmountPaid), Curr(i.Outstanding),
                        i.IssueDate?.ToString("dd MMM, yyyy") ?? "-",
                        i.DueDate?.ToString("dd MMM, yyyy") ?? "-"
                    })),
            },
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"invoices-client-{clientId}.pdf");
    }

    /// <summary>Export filtered invoices as a PDF.</summary>
    [HttpGet("filtered/pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredPdf(
        [FromQuery] int? statusId,
        [FromQuery] int? clientId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var result = await _invoiceService.GetFilteredAsync(statusId, clientId, dateFrom, dateTo, userId, IsAdmin());
        if (!result.Success || result.Data is null) return BadRequest(result.Message);

        var data        = result.Data;
        var salesTotal  = data.Where(i => i.Type == "Order").Sum(i => i.TotalAmount);
        var purchTotal  = data.Where(i => i.Type == "Purchase").Sum(i => i.TotalAmount);
        var receivable  = data.Where(i => i.Direction == "Receivable").Sum(i => i.Outstanding);
        var payable     = data.Where(i => i.Direction == "Payable").Sum(i => i.Outstanding);

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel       = "INVOICES",
            Reference           = $"HT-FILTERED-{DateTime.Now:yyyyMMdd-HHmm}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = "Management",
            PreparedForSubtitle = "Filtered Invoices",
            PeriodLabel         = "GENERATED",
            PeriodValue         = DateOnly.FromDateTime(DateTime.UtcNow).ToString("dd MMM, yyyy"),
            Stats = new()
            {
                new Stat("Sales Invoices (Receivable)",  Curr(salesTotal)),
                new Stat("Purchase Invoices (Payable)",   Curr(purchTotal)),
                new Stat("Receivable (Owed to Us)",       Curr(receivable), Highlight: true),
                new Stat("Payable (We Owe)",              Curr(payable)),
            },
            Sections = new()
            {
                new TableSection(
                    "Invoice List",
                    Headers:    new[] { "#", "Invoice #", "Bill No", "Client", "Direction", "Status", "Total", "Paid", "Outstanding", "Issue Date" },
                    RightAlign: new[] { 6, 7, 8 },
                    Rows:       data.Select((i, idx) => new[]
                    {
                        (idx + 1).ToString(), i.InvoiceNumber, i.BillNo ?? "—", i.ClientName, i.Direction, i.StatusName,
                        Curr(i.TotalAmount), Curr(i.AmountPaid), Curr(i.Outstanding),
                        i.IssueDate?.ToString("dd MMM, yyyy") ?? "-"
                    })),
            },
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", "invoices-filtered.pdf");
    }

    private static string Curr(decimal v) => PdfFormat.Rs(v);
}
