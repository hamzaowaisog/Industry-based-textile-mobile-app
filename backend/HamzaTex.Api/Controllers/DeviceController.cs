using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Device token management — register and unregister FCM push notification tokens for the authenticated user.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class DeviceController : BaseController
{
    private readonly IDeviceService _deviceService;

    public DeviceController(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    /// <summary>Register or refresh an FCM device token for push notifications.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDeviceViewModel model)
    {
        if (ValidateModel<object>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new RegisterDeviceDto
        {
            PushToken = model.PushToken,
            DeviceType = model.DeviceType,
            AppVersion = model.AppVersion
        };

        return ToActionResult(await _deviceService.RegisterAsync(dto, userId.Value));
    }

    /// <summary>Unregister a specific FCM device token (e.g. on logout from this device).</summary>
    [HttpDelete("unregister")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Unregister([FromBody] UnregisterDeviceViewModel model)
    {
        if (ValidateModel<object>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _deviceService.UnregisterAsync(model.PushToken, userId.Value));
    }

    /// <summary>Unregister all FCM device tokens for the authenticated user (e.g. on logout-all).</summary>
    [HttpDelete("unregister-all")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    public async Task<IActionResult> UnregisterAll()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _deviceService.UnregisterAllAsync(userId.Value));
    }
}
