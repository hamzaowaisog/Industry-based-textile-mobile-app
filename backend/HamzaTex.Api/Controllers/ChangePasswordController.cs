using System.Security.Claims;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
public class ChangePasswordController : ControllerBase
{
    private readonly IChangePasswordService _changePasswordService;

    public ChangePasswordController(IChangePasswordService changePasswordService)
    {
        _changePasswordService = changePasswordService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordViewModel model)
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

        var dto = new ChangePasswordDto
        {
            UserId = userId,
            OldPassword = model.OldPassword,
            NewPassword = model.NewPassword,
            ConfirmPassword = model.ConfirmPassword
        };

        var response = await _changePasswordService.ChangePasswordAsync(dto);
        return ToActionResult(response);
    }

    private IActionResult ToActionResult<T>(Response<T> response)
    {
        if (response.Success)
        {
            return Ok(response);
        }

        return BadRequest(response);
    }

    private static bool IsNotFound(string message) =>
        string.Equals(message, "Not found", StringComparison.OrdinalIgnoreCase);
}