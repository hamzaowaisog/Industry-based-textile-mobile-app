using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class StockMovementsController : BaseController
{
    private readonly IStockMovementsService _stockMovementsService;
    private readonly IPdfService _pdfService;

    public StockMovementsController(IStockMovementsService stockMovementsService, IPdfService pdfService)
    {
        _stockMovementsService = stockMovementsService;
        _pdfService = pdfService;
    }

    /// <summary>Record a new stock movement. MovementType is auto-derived for Purchase (In) and Sale (Out); required only for Manual source.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStockMovement([FromBody] StockMovementsCreateViewModel model)
    {
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<StockMovementsDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new CreateStockMovementsDto
        {
            ProductId      = model.ProductId,
            MovementSource = model.MovementSource,
            MovementType   = model.MovementType,
            Qty            = model.Qty,
            UnitCost       = model.UnitCost,
            UnitPrice      = model.UnitPrice,
            MovementDate   = model.MovementDate
        };

        var response = await _stockMovementsService.CreateAsync(dto, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Get all stock movements for the authenticated user's products, paginated.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Response<PagedList<StockMovementsDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStockMovementsPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.GetAllPaginatedAsync(page, pageSize, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Get a single stock movement by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStockMovementById(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.GetByIdAsync(id, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Filter stock movements by product, type, source, and/or date range.</summary>
    [HttpGet("filtered")]
    [ProducesResponseType(typeof(Response<List<StockMovementsDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilteredStockMovements(
        [FromQuery] int? productId = null,
        [FromQuery] int? movementTypeId = null,
        [FromQuery] int? movementSourceId = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.GetFilteredAsync(
            productId, movementTypeId, movementSourceId, dateFrom, dateTo, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Update a stock movement record. Does not recalculate product averages — use a new Manual movement for stock corrections.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStockMovement(int id, [FromBody] StockMovementsUpdateViewModel model)
    {
        if (!ModelState.IsValid)
            return ToActionResult(ToValidationResponseFromModelState<StockMovementsDto>());

        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var dto = new UpdateStockMovementsDto
        {
            ProductId      = model.ProductId,
            MovementSource = model.MovementSource,
            MovementType   = model.MovementType,
            Qty            = model.Qty,
            UnitCost       = model.UnitCost,
            UnitPrice      = model.UnitPrice,
            MovementDate   = model.MovementDate
        };

        var response = await _stockMovementsService.UpdateByIdAsync(id, dto, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Delete a stock movement record. Admin only.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStockMovement(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.DeleteByIdAsync(id, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Download all stock movements as a PDF report.</summary>
    [HttpGet("pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockMovementsPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.GetAllAsync(userId.Value);
        if (!response.Success)
            return BadRequest(response.Message);

        var movements = response.Data ?? new List<StockMovementsDto>();
        var pdfBytes = _pdfService.CreatePdf(
            "Stock Movements",
            "All stock movements — In (purchases) and Out (sales).",
            movements,
            EntityPdfConfigs.StockMovement);

        return File(pdfBytes, "application/pdf", "stock-movements.pdf");
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
