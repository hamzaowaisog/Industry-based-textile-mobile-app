using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Dashboard aggregation endpoints for the mobile home screen.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Policy = "Authenticated")]
public class DashboardController : BaseController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private bool IsAdmin()
    {
        var claim = User.FindFirst(ClaimTypes.Role);
        return claim is not null && int.TryParse(claim.Value, out var id) && id == 1;
    }

    /// <summary>Role-scoped dashboard summary: financials, operations, alerts, recent orders.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(Response<DashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _dashboardService.GetSummaryAsync(userId.Value, IsAdmin()));
    }

    /// <summary>Last N months of aggregated financials for charts. Query param: ?months=6 (1-12).</summary>
    [HttpGet("monthly-overview")]
    [ProducesResponseType(typeof(Response<MonthlyOverviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonthlyOverview([FromQuery] int months = 6)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _dashboardService.GetMonthlyOverviewAsync(userId.Value, IsAdmin(), months));
    }
}
