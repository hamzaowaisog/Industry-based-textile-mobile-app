using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Order (sales) management — create, view, update status, and delete orders. Staff see their own clients' orders; Admin sees all.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class OrderController : BaseController
{
    private readonly IOrderService _orderService;
    private readonly IPdfService _pdfService;

    public OrderController(IOrderService orderService, IPdfService pdfService)
    {
        _orderService = orderService;
        _pdfService = pdfService;
    }

    /// <summary>Create a new order with lines. Client must be a Customer (ClientTypeId=1).</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateViewModel model)
    {
        if (ValidateModel<OrderDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new CreateOrderDto
        {
            ClientId = model.ClientId,
            PaymentTypeId = model.PaymentTypeId,
            OrderDate = model.OrderDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            OrderDateHijri = model.OrderDateHijri,
            Notes = model.Notes,
            BillNo = model.BillNo,
            Lines = model.Lines.Select(l => new CreateOrderLineDto
            {
                ProductId = l.ProductId,
                Qty = l.Qty,
                UnitPrice = l.UnitPrice
            }).ToList()
        };

        var response = await _orderService.CreateAsync(dto, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Get all orders, paginated. Staff see only their own; Admin sees all.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<OrderDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOrdersPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetAllPaginatedAsync(page, pageSize, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Get a single order by ID with lines.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetByIdAsync(id, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Filter orders by clientId, statusId, date range, and/or a free-text search matching BillNo or client name.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<OrderDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredOrders(
        [FromQuery] int? clientId = null,
        [FromQuery] int? statusId = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? search = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetFilteredAsync(clientId, statusId, dateFrom, dateTo, search, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Update an order header. Handles status transitions: Delivered triggers stock+ledger, Cancelled reverses them.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateViewModel model)
    {
        if (ValidateModel<OrderDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdateOrderDto
        {
            StatusId = model.StatusId,
            PaymentTypeId = model.PaymentTypeId,
            Notes = model.Notes,
            BillNo = model.BillNo,
            OrderDate = model.OrderDate
        };

        var response = await _orderService.UpdateByIdAsync(id, dto, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Replace all lines on a Pending or InProgress order. Syncs the linked Draft invoice. Blocked for Delivered/Cancelled orders.</summary>
    [HttpPut("{id}/lines")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<OrderDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderLines(int id, [FromBody] OrderLinesUpdateViewModel model)
    {
        if (ValidateModel<OrderDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdateOrderLinesDto
        {
            Lines = model.Lines.Select(l => new CreateOrderLineDto
            {
                ProductId = l.ProductId,
                Qty       = l.Qty,
                UnitPrice = l.UnitPrice
            }).ToList()
        };

        var response = await _orderService.UpdateLinesAsync(id, dto, userId.Value, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Delete an order and its lines. Admin only. Not allowed if order has been Delivered.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var response = await _orderService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download an orders PDF report. Admin sees all orders; non-admins see only their own.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrdersPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetAllAsync(userId.Value, IsAdmin());

        if (!response.Success)
            return BadRequest(response.Message);

        var orders = response.Data ?? new List<OrderDto>();
        var pdfBytes = _pdfService.CreatePdf(
            "Orders",
            "Sales orders report. All amounts in PKR.",
            orders,
            EntityPdfConfigs.Order,
            new PdfOptions {
                ShowRowNumbers = true,
                SummaryProperty = "Total",
                SummaryLabel = "Grand Total (PKR)",
                SummaryExcludeProperty = "StatusId",
                SummaryExcludeValues = new List<object> { 4 }
            });

        return File(pdfBytes, "application/pdf", "orders.pdf");
    }

    /// <summary>Download a single order as a branded PDF dossier — header, line items, totals, and payment status.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderDossierPdf([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in token.");

        var response = await _orderService.GetByIdAsync(id, userId.Value, IsAdmin());
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var o = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "ORDER",
            Reference           = $"HT-ORDER-{o.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = o.ClientName ?? "—",
            PreparedForSubtitle = $"{o.StatusName} · {o.PaymentTypeName}",
            PeriodLabel         = "ORDER DATE",
            PeriodValue         = o.OrderDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Bill No", !string.IsNullOrWhiteSpace(o.BillNo) ? o.BillNo : "—"),
                new Stat("Status", o.StatusName ?? "—"),
                new Stat("Total", PdfFormat.Rs(o.Total)),
                new Stat("Received", PdfFormat.Rs(o.AmountReceived)),
                new Stat("Receivable", PdfFormat.Rs(o.Receivable), Highlight: true),
                new Stat("Payment", o.PaymentStatus),
            },
            Sections = new()
            {
                new TableSection(
                    "Line Items",
                    Headers:    new[] { "#", "Product", "Qty", "Unit Price", "Line Total" },
                    RightAlign: new[] { 2, 3, 4 },
                    Rows:       o.OrderLines.Select((l, i) => new[]
                    {
                        (i + 1).ToString(),
                        l.ProductName ?? "—",
                        l.Qty.ToString("0.##"),
                        PdfFormat.Rs(l.UnitPrice),
                        PdfFormat.Rs(l.LineTotal),
                    })),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "PAYMENT STATUS",
                LeftSubtitle: o.PaymentStatus,
                RightLabel:   "ORDER TOTAL",
                RightValue:   PdfFormat.Rs(o.Total)),
            ClosingNote = !string.IsNullOrWhiteSpace(o.Notes) ? $"Notes: {o.Notes}" : null,
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"order-{o.Id}.pdf");
    }
}
