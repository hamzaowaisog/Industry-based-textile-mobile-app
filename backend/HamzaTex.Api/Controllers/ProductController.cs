using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Product catalogue and inventory. Products are scoped to the authenticated user via ProductUser. All stock quantity and weighted averages are managed automatically through StockMovements — do not edit Quantity or AverageCost directly.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class ProductController : BaseController
{
    private readonly IProductService _productService;
    private readonly IPdfService _pdfService;
    private readonly IStockMovementsService _stockMovementsService;

    public ProductController(IProductService productService, IPdfService pdfService, IStockMovementsService stockMovementsService)
    {
        _productService = productService;
        _pdfService = pdfService;
        _stockMovementsService = stockMovementsService;
    }

    /// <summary>Create a new product and link it to the authenticated user. Records an initial stock movement for the opening quantity.</summary>
    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateViewModel model)
    {
        if (ValidateModel<ProductDto>() is { } invalid)
            return invalid;

        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new CreateProductDto
        {
            Name = model.Name,
            Sku = model.Sku,
            UnitId = model.UnitId,
            DefaultCost = model.DefaultCost,
            DefaultPrice = model.DefaultPrice,
            Quantity = model.Quantity,
            AverageCost = model.DefaultCost,
            AveragePrice = null,
            CostChangeCount = 1,
            PriceChangeCount = 0,
            TotalQuantityPurchased = model.Quantity,
            TotalQuantitySold = 0,
            ReorderLevel = model.ReorderLevel,
            IsActive = model.IsActive
        };

        var response = await _productService.CreateWithUserIdAsync(dto, userId);
        return ToActionResult(response);
    }

    /// <summary>Get a single product by ID scoped to the authenticated user.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _productService.GetByIdAsync(id, userId);
        return ToActionResult(response);
    }

    /// <summary>Get all products for the authenticated user.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<ProductDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllProducts()
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _productService.GetAllAsync(userId);
        return ToActionResult(response);
    }


    /// <summary>Update product details. Do not use this to adjust stock — create a Manual StockMovement instead.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<ProductDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductById(int id, [FromBody] ProductUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new UpdateProductByIdDto
        {
            Name = model.Name,
            Sku = model.Sku,
            UnitId = model.UnitId,
            DefaultCost = model.DefaultCost,
            DefaultPrice = model.DefaultPrice,
            Quantity = model.Quantity,
            AverageCost = model.AverageCost,
            AveragePrice = model.AveragePrice,
            CostChangeCount = model.CostChangeCount,
            PriceChangeCount = model.PriceChangeCount,
            TotalQuantitySold = model.TotalQuantitySold,
            TotalQuantityPurchased = model.TotalQuantityPurchased,
            ReorderLevel = model.ReorderLevel,
            IsActive = model.IsActive
        };

        var response = await _productService.UpdateByIdAsync(id, dto, userId);
        return ToActionResult(response);
    }


    /// <summary>Delete a product by ID.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProductById(int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _productService.DeleteByIdAsync(id, userId);
        return ToActionResult(response);
    }

    /// <summary>Get paginated products for the authenticated user.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<ProductDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllProductsPaginated(int page = 1, int pageSize = 5)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _productService.GetAllPaginatedAsync(page, pageSize, userId);
        return ToActionResult(response);
    }

    /// <summary>Download the authenticated user's product list as a PDF report. Summary shows total inventory value (Qty × Price).</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllProductsPdf()
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;
        var response = await _productService.GetAllAsync(userId);
        if (!response.Success)
        {
            return BadRequest(response.Message);
        }
        var products = response.Data ?? new List<ProductDto>();
        var totalCost = products.Sum(p => (p.DefaultCost ?? 0) * (p.Quantity ?? 0));
        var totalValue = products.Sum(p => (p.DefaultPrice ?? 0) * (p.Quantity ?? 0));
        var pdfBytes = _pdfService.CreatePdf(
            "Products",
            "Cost and price are per meter. Quantity is in meters.",
            products,
            EntityPdfConfigs.Product,
            new PdfOptions {
                ShowRowNumbers = true,
                SummaryProperty = "DefaultPrice",
                SummaryMultiplierProperty = "Quantity",
                SummaryLabel = "Total Value (Qty × Price)",
                Stats = new List<Stat> {
                    new("Total Cost (Qty × Cost)", PdfFormat.Rs(totalCost)),
                    new("Total Value (Qty × Price)", PdfFormat.Rs(totalValue), Highlight: true)
                }
            });
        return File(pdfBytes, "application/pdf", "products.pdf");
    }

    /// <summary>Download a single product's full dossier as a branded PDF — profile, valuation, and complete stock-movement history. Scoped to the authenticated user's products.</summary>
    [HttpGet("{id:int}/pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductDossierPdf([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;
        var isAdmin = IsAdmin();

        var productResp = await _productService.GetByIdAsync(id, userId);
        if (!productResp.Success || productResp.Data is null)
            return NotFound(productResp.Message);

        var p = productResp.Data;
        var movementsResp = await _stockMovementsService.GetByProductIdAsync(id, userId, isAdmin);
        var movements = movementsResp.Data ?? new List<StockMovementsDto>();

        var qty = p.Quantity ?? 0;
        var avgCost = p.AverageCost ?? 0;
        var inventoryValue = qty * avgCost;
        var isLowStock = p.ReorderLevel.HasValue && qty <= p.ReorderLevel.Value;

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "PRODUCT DOSSIER",
            Reference           = p.Sku,
            IssuedDate          = DateTime.Now,
            PreparedFor         = p.Name,
            PreparedForSubtitle = $"SKU {p.Sku} · Unit {p.UnitName}",
            PeriodLabel         = "AS OF",
            PeriodValue         = DateTime.Now.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Current Stock", $"{qty:0.##} {p.UnitName}"),
                new Stat("Avg Cost", PdfFormat.Rs(avgCost)),
                new Stat("Avg Price", PdfFormat.Rs(p.AveragePrice ?? 0)),
                new Stat("Inventory Value", PdfFormat.Rs(inventoryValue), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Stock Movements",
                    Headers:    new[] { "#", "Date", "Type", "Source", "Qty", "Unit Cost", "Unit Price" },
                    RightAlign: new[] { 4, 5, 6 },
                    Rows:       movements.Select((m, i) => new[]
                    {
                        (i + 1).ToString(),
                        m.MovementDate.ToString("dd MMM yyyy"),
                        m.MovementTypeName ?? "—",
                        m.MovementSourceName ?? "—",
                        m.Qty.ToString("0.##"),
                        m.UnitCost.HasValue ? PdfFormat.Rs(m.UnitCost.Value) : "—",
                        m.UnitPrice.HasValue ? PdfFormat.Rs(m.UnitPrice.Value) : "—",
                    })),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "LIFETIME MOVEMENT",
                LeftSubtitle: $"{p.TotalQuantityPurchased ?? 0:0.##} {p.UnitName} in · {p.TotalQuantitySold ?? 0:0.##} {p.UnitName} out",
                RightLabel:   "CURRENT STOCK",
                RightValue:   $"{qty:0.##} {p.UnitName}"),
            ClosingNote = isLowStock
                ? $"Below reorder level ({p.ReorderLevel} {p.UnitName})."
                : $"{movements.Count} stock movements recorded.",
        };

        var fileName = $"product-dossier-{p.Sku}.pdf";
        return File(_pdfService.CreateDocument(model), "application/pdf", fileName);
    }
}