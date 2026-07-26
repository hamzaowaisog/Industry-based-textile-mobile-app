using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Purchase (procurement) management — create, view, update status, and delete purchases. Staff see their own suppliers' purchases; Admin sees all.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class PurchaseController : BaseController
{
    private readonly IPurchaseService _purchaseService;
    private readonly IPdfService _pdfService;

    public PurchaseController(IPurchaseService purchaseService, IPdfService pdfService)
    {
        _purchaseService = purchaseService;
        _pdfService = pdfService;
    }

    /// <summary>Create a new purchase with lines. Supplier must be a Client with ClientTypeId=2.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePurchase([FromBody] PurchaseCreateViewModel model)
    {
        if (ValidateModel<PurchaseDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new CreatePurchaseDto
        {
            SupplierId = model.SupplierId,
            PaymentTypeId = model.PaymentTypeId,
            PurchaseDate = model.PurchaseDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            PurchaseDateHijri = model.PurchaseDateHijri,
            Notes = model.Notes,
            BillNo = model.BillNo,
            Lines = model.Lines.Select(l => new CreatePurchaseLineDto
            {
                ProductId = l.ProductId,
                Qty = l.Qty,
                UnitCost = l.UnitCost
            }).ToList()
        };

        var response = await _purchaseService.CreateAsync(dto, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Get all purchases, paginated. Staff see only their own; Admin sees all.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPurchasesPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetAllPaginatedAsync(page, pageSize, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Get a single purchase by ID with lines.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPurchaseById(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetByIdAsync(id, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Filter purchases by supplierId, statusId, date range, and/or a free-text search matching BillNo or supplier name.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredPurchases(
        [FromQuery] int? supplierId = null,
        [FromQuery] int? statusId = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? search = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetFilteredAsync(supplierId, statusId, dateFrom, dateTo, search, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Update a purchase header. Handles status transitions: Delivered triggers stock In + ledger, Cancelled reverses them.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePurchase(int id, [FromBody] PurchaseUpdateViewModel model)
    {
        if (ValidateModel<PurchaseDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdatePurchaseDto
        {
            StatusId = model.StatusId,
            PaymentTypeId = model.PaymentTypeId,
            Notes = model.Notes,
            BillNo = model.BillNo,
            PurchaseDate = model.PurchaseDate
        };

        var response = await _purchaseService.UpdateByIdAsync(id, dto, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Replace all lines on a Pending or InProgress purchase. Syncs the linked Draft invoice. Blocked for Delivered/Cancelled purchases.</summary>
    [HttpPut("{id}/lines")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<PurchaseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePurchaseLines(int id, [FromBody] PurchaseLinesUpdateViewModel model)
    {
        if (ValidateModel<PurchaseDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdatePurchaseLinesDto
        {
            Lines = model.Lines.Select(l => new CreatePurchaseLineDto
            {
                ProductId = l.ProductId,
                Qty       = l.Qty,
                UnitCost  = l.UnitCost
            }).ToList()
        };

        var response = await _purchaseService.UpdateLinesAsync(id, dto, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Delete a purchase and its lines. Admin only. Not allowed if purchase has been Delivered.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePurchase(int id)
    {
        var response = await _purchaseService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download a purchases PDF report. Admin sees all purchases; non-admins see only their own.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPurchasesPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetAllAsync(userId.Value, IsAdmin());

        if (!response.Success)
            return BadRequest(response.Message);

        var purchases = response.Data ?? new List<PurchaseDto>();
        var pdfBytes = _pdfService.CreatePdf(
            "Purchases",
            "Procurement purchases report. All amounts in PKR.",
            purchases,
            EntityPdfConfigs.Purchase,
            new PdfOptions {
                ShowRowNumbers = true,
                SummaryProperty = "Total",
                SummaryLabel = "Grand Total (PKR)",
                SummaryExcludeProperty = "StatusId",
                SummaryExcludeValues = new List<object> { 4 }
            });

        return File(pdfBytes, "application/pdf", "purchases.pdf");
    }

    /// <summary>Download a single purchase as a branded PDF dossier — supplier, line items, totals, and payment status.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPurchaseDossierPdf([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in token.");

        var response = await _purchaseService.GetByIdAsync(id, userId.Value, IsAdmin());
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var p = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "PURCHASE",
            Reference           = $"HT-PURCHASE-{p.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = p.SupplierName ?? "—",
            PreparedForSubtitle = $"{p.StatusName} · {p.PaymentTypeName}",
            PeriodLabel         = "PURCHASE DATE",
            PeriodValue         = p.PurchaseDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Bill No", !string.IsNullOrWhiteSpace(p.BillNo) ? p.BillNo : "—"),
                new Stat("Status", p.StatusName ?? "—"),
                new Stat("Total", PdfFormat.Rs(p.Total)),
                new Stat("Paid", PdfFormat.Rs(p.AmountPaid)),
                new Stat("Payable", PdfFormat.Rs(p.Payable), Highlight: true),
                new Stat("Payment", p.PaymentStatus),
            },
            Sections = new()
            {
                new TableSection(
                    "Line Items",
                    Headers:    new[] { "#", "Product", "Qty", "Unit Cost", "Line Total" },
                    RightAlign: new[] { 2, 3, 4 },
                    Rows:       p.PurchaseLines.Select((l, i) => new[]
                    {
                        (i + 1).ToString(),
                        l.ProductName ?? "—",
                        l.Qty.ToString("0.##"),
                        PdfFormat.Rs(l.UnitCost),
                        PdfFormat.Rs(l.Qty * l.UnitCost),
                    })),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "PAYMENT STATUS",
                LeftSubtitle: p.PaymentStatus,
                RightLabel:   "PURCHASE TOTAL",
                RightValue:   PdfFormat.Rs(p.Total)),
            ClosingNote = !string.IsNullOrWhiteSpace(p.Notes) ? $"Notes: {p.Notes}" : null,
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"purchase-{p.Id}.pdf");
    }
}
