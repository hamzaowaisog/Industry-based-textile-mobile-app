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
        if (ValidateModel<StockMovementsDto>() is { } invalid)
            return invalid;

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
            MovementDate   = model.MovementDate ?? DateOnly.FromDateTime(DateTime.UtcNow)
        };

        var response = await _stockMovementsService.CreateAsync(dto, userId.Value);
        return ToActionResult(response);
    }

    /// <summary>Get all stock movements, paginated. Non-admins see only movements for their own products; Admin sees all.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Response<PagedList<StockMovementsDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStockMovementsPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _stockMovementsService.GetAllPaginatedAsync(page, pageSize, userId.Value, IsAdmin());
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

    /// <summary>Get all stock movements for a specific product, ordered by date descending (most recent first). Admin sees all; Staff scoped to their own products.</summary>
    [HttpGet("by-product/{productId}")]
    [ProducesResponseType(typeof(Response<List<StockMovementsDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var isAdmin = IsAdmin();
        var response = await _stockMovementsService.GetByProductIdAsync(productId, userId.Value, isAdmin);
        return ToActionResult(response);
    }

    /// <summary>Update a Manual stock movement record and recalculate product quantity/averages from full history. Purchase and Sale movements cannot be edited directly — they are controlled by their parent Purchase/Order document.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<StockMovementsDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStockMovement(int id, [FromBody] StockMovementsUpdateViewModel model)
    {
        if (ValidateModel<StockMovementsDto>() is { } invalid)
            return invalid;

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

    /// <summary>Delete a Manual stock movement record and recalculate product quantity/averages from the remaining history. Admin only. Purchase and Sale movements cannot be deleted directly — they are controlled by their parent Purchase/Order document.</summary>
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
        var totalIn = movements.Where(m => m.MovementType == 1).Sum(m => m.Qty);
        var totalOut = movements.Where(m => m.MovementType == 2).Sum(m => m.Qty);
        var pdfBytes = _pdfService.CreatePdf(
            "Stock Movements",
            "All stock movements — In (purchases) and Out (sales).",
            movements,
            EntityPdfConfigs.StockMovement,
            new PdfOptions
            {
                ShowRowNumbers = true,
                Stats = new()
                {
                    new Stat("Total Stock In", $"{totalIn:0.##}", Highlight: true),
                    new Stat("Total Stock Out", $"{totalOut:0.##}"),
                },
            });

        return File(pdfBytes, "application/pdf", "stock-movements.pdf");
    }

    /// <summary>Download a single stock movement as a branded PDF receipt — product, type/source, quantities, and value snapshots.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStockMovementDossierPdf([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in token.");

        var response = await _stockMovementsService.GetByIdAsync(id, userId.Value);
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var m = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "STOCK MOVEMENT",
            Reference           = $"HT-MOVEMENT-{m.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = m.ProductName ?? "—",
            PreparedForSubtitle = $"{m.MovementTypeName} · {m.MovementSourceName}",
            PeriodLabel         = "MOVEMENT DATE",
            PeriodValue         = m.MovementDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Quantity", $"{m.Qty:0.##}", Highlight: true),
                new Stat("Unit Cost", m.UnitCost.HasValue ? PdfFormat.Rs(m.UnitCost.Value) : "—"),
                new Stat("Unit Price", m.UnitPrice.HasValue ? PdfFormat.Rs(m.UnitPrice.Value) : "—"),
            },
            Sections = new()
            {
                new TableSection(
                    "Details",
                    Headers: new[] { "Field", "Value" },
                    Rows: new[]
                    {
                        new[] { "Type", m.MovementTypeName ?? "—" },
                        new[] { "Source", m.MovementSourceName ?? "—" },
                        new[] { "Date", m.MovementDate.ToString("dd MMM yyyy") },
                        new[] { "Avg Cost Snapshot", m.AverageCostAtMovement.HasValue ? PdfFormat.Rs(m.AverageCostAtMovement.Value) : "—" },
                        new[] { "Avg Price Snapshot", m.AveragePriceAtMovement.HasValue ? PdfFormat.Rs(m.AveragePriceAtMovement.Value) : "—" },
                        new[] { "Current Avg Cost", m.CurrentAverageCost.HasValue ? PdfFormat.Rs(m.CurrentAverageCost.Value) : "—" },
                        new[] { "Current Avg Price", m.CurrentAveragePrice.HasValue ? PdfFormat.Rs(m.CurrentAveragePrice.Value) : "—" },
                    }),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "MOVEMENT",
                LeftSubtitle: $"{m.MovementTypeName} · {m.MovementSourceName}",
                RightLabel:   "QUANTITY",
                RightValue:   $"{m.Qty:0.##}"),
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"stock-movement-{m.Id}.pdf");
    }

    private bool IsAdmin()
    {
        var roleIdClaim = User.FindFirst("RoleId");
        return roleIdClaim is not null && int.TryParse(roleIdClaim.Value, out var roleId) && roleId == 1;
    }
}
