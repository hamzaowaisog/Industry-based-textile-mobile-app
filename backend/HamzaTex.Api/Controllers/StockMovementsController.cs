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
public class StockMovementsController : BaseController
{
    private readonly IStockMovementsService _stockMovementsService;

    public StockMovementsController(IStockMovementsService stockMovementsService)
    {
        _stockMovementsService = stockMovementsService;
    }

    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStockMovement([FromBody] StockMovementsCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var validationResponse = ToValidationResponseFromModelState<StockMovementsCreateViewModel>();
            return ToActionResult(validationResponse);
        }



        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new CreateStockMovementsDto
        {
            ProductId = model.ProductId,
            MovementSource = model.MovementSource,
            MovementType = model.MovementType,
            Qty = model.Qty,
            UnitCost = model.UnitCost,
            UnitPrice = model.UnitPrice,
            MovementDate = model.MovementDate
        };

        var response = await _stockMovementsService.CreateAsync(dto, userId);
        return ToActionResult(response);
    }
    
}
