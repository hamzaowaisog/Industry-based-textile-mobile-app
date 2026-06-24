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

    public ProductController(IProductService productService, IPdfService pdfService)
    {
        _productService = productService;
        _pdfService = pdfService;
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
            Unit = model.Unit,
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
            Unit = model.Unit,
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
        var pdfBytes = _pdfService.CreatePdf("Products", "Cost and price are per meter. Quantity is in meters.", products, EntityPdfConfigs.Product, new PdfOptions { ShowRowNumbers = true, SummaryProperty = "DefaultPrice", SummaryMultiplierProperty = "Quantity", SummaryLabel = "Total Value (Qty × Price)" });
        return File(pdfBytes, "application/pdf", "products.pdf");
    }
}