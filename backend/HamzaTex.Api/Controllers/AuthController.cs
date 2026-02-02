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
[AllowAnonymous]
public class AuthController : BaseController
{
    private readonly IUserService _userService;
    private readonly ILoginService _loginService;
    private readonly IChangePasswordService _changePasswordService;

    public AuthController(
        IUserService userService,
        ILoginService loginService,
        IChangePasswordService changePasswordService)
    {
        _userService = userService;
        _loginService = loginService;
        _changePasswordService = changePasswordService;
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] UserCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new CreateUserDto
        {
            Name = model.Name,
            Email = model.Email,
            UserName = model.UserName,
            Password = model.Password,
            ConfirmPassword = model.ConfirmPassword,
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            PhoneNumber = model.PhoneNumber,
            CreatedAt = model.CreatedAt
        };

        var response = await _userService.SignupAsync(dto);
        return ToActionResult(response);
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new LoginDto
        {
            UserName = model.UserName,
            Password = model.Password
        };

        var response = await _loginService.LoginAsync(dto);
        return ToActionResult(response);
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest? request = null)
    {
        Response response;

        if (request != null && !string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            response = await _loginService.LogoutAsync(request.RefreshToken);
        }
        else
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User identifier is missing or invalid in the token.");
            }

            response = await _loginService.LogoutAllAsync(userId);
        }

        return ToActionResult(response);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest("Refresh token is required");
        }

        var response = await _loginService.RefreshTokenAsync(request.RefreshToken);
        return ToActionResult(response);
    }

    [HttpPost("change-password")]
    [Authorize(Policy = "Authenticated")]
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
}
