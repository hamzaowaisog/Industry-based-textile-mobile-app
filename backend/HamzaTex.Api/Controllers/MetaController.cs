using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>
/// Read-only metadata for all lookup / enum-style tables.
/// Call GET /api/Meta/all once on app startup and cache locally.
///
/// Valid type names for GET /api/Meta/{type}:
/// orderStatuses, paymentTypes, paymentDirections, transTypes, transModes,
/// transCategories, expenseTypes, movementTypes, movementSources, clientTypes, userRoles (AdminOnly)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class MetaController : BaseController
{
    private readonly ILookupService _lookupService;

    public MetaController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    /// <summary>Returns all lookup tables in a single response. Cache this on the frontend at app startup.</summary>
    [HttpGet("all")]
    [ProducesResponseType(typeof(Response<LookupsAllDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
        => ToActionResult(await _lookupService.GetAllAsync());

    /// <summary>
    /// Get a single lookup table by type name.
    /// Accepts camelCase (orderStatuses) or kebab-case (order-statuses).
    /// Returns 400 with a list of valid type names if the type is unknown.
    /// </summary>
    [HttpGet("{type}")]
    [ProducesResponseType(typeof(Response<List<LookupDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<List<LookupDto>>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByType(string type)
    {
        // userRoles is admin-only
        if (type.Equals("userRoles", StringComparison.OrdinalIgnoreCase) ||
            type.Equals("user-roles", StringComparison.OrdinalIgnoreCase))
        {
            var roleIdClaim = User.FindFirst("RoleId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (roleIdClaim is null || roleIdClaim.Value != "1")
                return Forbid();
        }

        var response = await _lookupService.GetByTypeAsync(type);
        return ToActionResult(response);
    }
}
