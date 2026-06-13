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
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<OrderDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new CreateOrderDto
        {
            ClientId = model.ClientId,
            PaymentTypeId = model.PaymentTypeId,
            OrderDate = model.OrderDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Notes = model.Notes,
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

    /// <summary>Get all orders, paginated. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PagedList<OrderDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOrdersPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var response = await _orderService.GetAllPaginatedAsync(page, pageSize);
        return ToActionResult(response);
    }

    /// <summary>Get all orders belonging to the authenticated user's clients.</summary>
    [HttpGet("me")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<OrderDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetAllByUserIdAsync(userId.Value);
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

    /// <summary>Filter orders by clientId, statusId, and/or date range.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<OrderDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredOrders(
        [FromQuery] int? clientId = null,
        [FromQuery] int? statusId = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _orderService.GetFilteredAsync(clientId, statusId, dateFrom, dateTo, userId.Value, IsAdmin());
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
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<OrderDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdateOrderDto
        {
            StatusId = model.StatusId,
            PaymentTypeId = model.PaymentTypeId,
            Notes = model.Notes,
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
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<OrderDto>());

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

    /// <summary>Download all orders for the authenticated user as a PDF report.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrdersPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = IsAdmin()
            ? await _orderService.GetAllAsync()
            : await _orderService.GetAllByUserIdAsync(userId.Value);

        if (!response.Success)
            return BadRequest(response.Message);

        var orders = response.Data ?? new List<OrderDto>();
        var pdfBytes = _pdfService.CreatePdf(
            "Orders",
            "Sales orders report. All amounts in PKR.",
            orders,
            EntityPdfConfigs.Order,
            new PdfOptions { ShowRowNumbers = true, SummaryProperty = "Total", SummaryLabel = "Grand Total (PKR)" });

        return File(pdfBytes, "application/pdf", "orders.pdf");
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private bool IsAdmin()
    {
        var roleIdClaim = User.FindFirst("RoleId");
        return roleIdClaim is not null && int.TryParse(roleIdClaim.Value, out var roleId) && roleId == 1;
    }
}
