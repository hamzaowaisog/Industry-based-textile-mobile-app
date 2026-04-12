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
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<PurchaseDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new CreatePurchaseDto
        {
            SupplierId = model.SupplierId,
            PaymentTypeId = model.PaymentTypeId,
            PurchaseDate = model.PurchaseDate,
            Notes = model.Notes,
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

    /// <summary>Get all purchases, paginated. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PagedList<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPurchasesPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var response = await _purchaseService.GetAllPaginatedAsync(page, pageSize);
        return ToActionResult(response);
    }

    /// <summary>Get all purchases belonging to the authenticated user's supplier clients.</summary>
    [HttpGet("me")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPurchases()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetAllByUserIdAsync(userId.Value);
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

    /// <summary>Filter purchases by supplierId, statusId, and/or date range.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<PurchaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredPurchases(
        [FromQuery] int? supplierId = null,
        [FromQuery] int? statusId = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _purchaseService.GetFilteredAsync(supplierId, statusId, dateFrom, dateTo, userId.Value, IsAdmin());
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
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<PurchaseDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdatePurchaseDto
        {
            StatusId = model.StatusId,
            PaymentTypeId = model.PaymentTypeId,
            Notes = model.Notes,
            PurchaseDate = model.PurchaseDate
        };

        var response = await _purchaseService.UpdateByIdAsync(id, dto, userId.Value, IsAdmin());
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

    /// <summary>Download all purchases for the authenticated user as a PDF report.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPurchasesPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = IsAdmin()
            ? await _purchaseService.GetAllAsync()
            : await _purchaseService.GetAllByUserIdAsync(userId.Value);

        if (!response.Success)
            return BadRequest(response.Message);

        var purchases = response.Data ?? new List<PurchaseDto>();
        var pdfBytes = _pdfService.CreatePdf(
            "Purchases",
            "Procurement purchases report. All amounts in PKR.",
            purchases,
            EntityPdfConfigs.Purchase,
            new PdfOptions { SummaryProperty = "Total", SummaryLabel = "Grand Total (PKR)" });

        return File(pdfBytes, "application/pdf", "purchases.pdf");
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
