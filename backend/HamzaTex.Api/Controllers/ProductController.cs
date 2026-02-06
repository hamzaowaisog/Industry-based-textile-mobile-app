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
public class ProductController : BaseController
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var validationResponse = ToValidationResponseFromModelState<ProductDto>();
            return ToActionResult(validationResponse);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new CreateProductDto
        {
            Name = model.Name,
            Sku = model.Sku,
            Unit = model.Unit,
            DefaultCost = model.DefaultCost,
            DefaultPrice = model.DefaultPrice,
            Quantity = model.Quantity,
            ReorderLevel = model.ReorderLevel,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };

        var response = await _productService.CreateWithUserIdAsync(dto, userId);
        return ToActionResult(response);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _productService.GetByIdAsync(id, userId);
        return ToActionResult(response);
    }

    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllProducts()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _productService.GetAllAsync(userId);
        return ToActionResult(response);
    }


    [HttpPut("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductById(int id, [FromBody] ProductUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new UpdateProductByIdDto
        {
            Name = model.Name,
            Sku = model.Sku,
            Unit = model.Unit,
            DefaultCost = model.DefaultCost,
            DefaultPrice = model.DefaultPrice,
            Quantity = model.Quantity,
            ReorderLevel = model.ReorderLevel,
            IsActive = model.IsActive
        };

        var response = await _productService.UpdateByIdAsync(id, dto, userId);
        return ToActionResult(response);
    }


    [HttpDelete("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProductById(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _productService.DeleteByIdAsync(id, userId);
        return ToActionResult(response);
    }

    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllProductsPaginated(int page = 1, int pageSize = 5)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _productService.GetAllPaginatedAsync(page, pageSize, userId);
        return ToActionResult(response);
    }
}