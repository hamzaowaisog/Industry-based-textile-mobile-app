using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Manages global system configuration, currently the Hijri calendar offset.</summary>
[Produces("application/json")]
[Route("api/[controller]")]
public class SettingsController : BaseController
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    /// <summary>Gets the current system settings.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<SettingsDto>), 200)]
    [ProducesResponseType(typeof(Response<SettingsDto>), 400)]
    public async Task<IActionResult> Get()
    {
        return ToActionResult(await _settingsService.GetAsync());
    }

    /// <summary>Updates the system settings (currently the Hijri offset, -2..+2 days).</summary>
    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<SettingsDto>), 200)]
    [ProducesResponseType(typeof(Response<SettingsDto>), 400)]
    public async Task<IActionResult> Update([FromBody] SettingsUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ToActionResult(ToValidationResponseFromModelState<SettingsDto>());
        }

        var result = await _settingsService.UpdateAsync(new UpdateSettingsDto { HijriOffsetDays = model.HijriOffsetDays });
        return ToActionResult(result);
    }
}
