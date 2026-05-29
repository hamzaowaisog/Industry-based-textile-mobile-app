using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Handles offline sync push and full-pull operations for mobile clients.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SyncController : BaseController
{
    private readonly ISyncService _syncService;

    public SyncController(ISyncService syncService)
    {
        _syncService = syncService;
    }

    /// <summary>Push a batch of offline-created records to the server. Each item is processed independently; partial failures are reported per-item.</summary>
    [HttpPost("push")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<SyncPushResultDto>), 200)]
    [ProducesResponseType(typeof(Response<SyncPushResultDto>), 400)]
    public async Task<IActionResult> Push([FromBody] SyncPushDto model)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _syncService.PushAsync(model, userId.Value, IsAdmin());
        return ToActionResult(result);
    }

    /// <summary>Return the full dataset for the authenticated user. Admin receives all records; staff receives only their scoped records. Mobile drops local tables and rebuilds from this response.</summary>
    [HttpPost("full-pull")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<SyncFullPullResponseDto>), 200)]
    [ProducesResponseType(typeof(Response<SyncFullPullResponseDto>), 400)]
    public async Task<IActionResult> FullPull()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _syncService.FullPullAsync(userId.Value, IsAdmin());
        return ToActionResult(result);
    }

    /// <summary>Return records modified since the given timestamp, scoped to the user. Used for incremental sync after initial full-pull.</summary>
    [HttpPost("delta-pull")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<SyncFullPullResponseDto>), 200)]
    [ProducesResponseType(typeof(Response<SyncFullPullResponseDto>), 400)]
    public async Task<IActionResult> DeltaPull([FromBody] SyncDeltaPullRequestDto model)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _syncService.DeltaPullAsync(model.Since, userId.Value, IsAdmin());
        return ToActionResult(result);
    }

    /// <summary>Return server UTC time so mobile can detect clock skew.</summary>
    [HttpGet("ping")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<DateTime>), 200)]
    public async Task<IActionResult> Ping()
    {
        var result = await _syncService.PingAsync();
        return ToActionResult(result);
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
