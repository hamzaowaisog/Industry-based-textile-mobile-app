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
            ReorderLevel = model.ReorderLevel,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };

        var response = await _productService.CreateWithUserIdAsync(dto, userId);
        return ToActionResult(response);
    }
}