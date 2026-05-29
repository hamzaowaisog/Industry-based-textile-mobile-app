using System.Security.Claims;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Authentication — register, login, logout, token refresh, password management, and email confirmation. All endpoints are public (no token required).</summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
[Produces("application/json")]
public class AuthController : BaseController
{
    private readonly IUserService _userService;
    private readonly ILoginService _loginService;
    private readonly IChangePasswordService _changePasswordService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(
        IUserService userService,
        ILoginService loginService,
        IChangePasswordService changePasswordService,
        UserManager<ApplicationUser> userManager)
    {
        _userService = userService;
        _loginService = loginService;
        _changePasswordService = changePasswordService;
        _userManager = userManager;
    }

    /// <summary>Register a new user account. Sends an email confirmation link before login is allowed.</summary>
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
            PhoneNumber = model.PhoneNumber
        };

        var response = await _userService.SignupAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Login with username and password. Returns a JWT access token and a refresh token.</summary>
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

    /// <summary>Logout. If a refresh token is provided, revokes that token only. Otherwise revokes all tokens for the current user.</summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest? request = null)
    {
        Response response;

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var currentUserId))
            return Unauthorized("User identifier is missing or invalid in the token.");

        if (request != null && !string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            response = await _loginService.LogoutAsync(request.RefreshToken, currentUserId, request.PushToken);
        }
        else
        {
            response = await _loginService.LogoutAllAsync(currentUserId);
        }

        return ToActionResult(response);
    }

    /// <summary>Exchange a valid refresh token for a new JWT access token and rotated refresh token.</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest("Refresh token is required");
        }

        var response = await _loginService.RefreshTokenAsync(request.RefreshToken);
        return ToActionResult(response);
    }

    /// <summary>Change the current user's password. Requires the existing password for verification.</summary>
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

    /// <summary>Confirm a user's email address using the token sent in the confirmation email. Returns an HTML page.</summary>
    [HttpGet("confirm-email")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmEmail([FromQuery] int userId, [FromQuery] string code) 
    {
        var dto = new EmailConfirmationDto
        {
            UserId = userId,
            Code = code
        };
        var response = await _userService.EmailConfirmationTokenAsync(dto);
        if (response.Success)
        {
            return Content(AuthHtmlHelper.GetConfirmEmailHtml(true, "Email confirmed successfully! You can close this page and return to the app."), "text/html");
        }
        return Content(AuthHtmlHelper.GetConfirmEmailHtml(false, response.Message ?? "Confirmation failed. The link may have expired."), "text/html");
    }

    /// <summary>Resend the email confirmation link to the given email address.</summary>
    [HttpPost("resend-email-confirmation")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResendEmailConfirmation([FromBody] ResendEmailConfirmationRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required");
        }
        var response = await _userService.ResendEmailConfirmationAsync(request.Email);
        return ToActionResult(response);
    }

    /// <summary>Send a password reset link to the given email address.</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
    {
        var dto = new ForgetPasswordDto
        {
            Email = model.Email
        };
        var response = await _userService.ForgotPasswordAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Renders the reset password HTML page. Called by the link in the forgot-password email — not for direct API use.</summary>
    [HttpGet("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult ResetPasswordPage([FromQuery] string? email, [FromQuery] string? code)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(code))
        {
            return Content(AuthHtmlHelper.GetResetPasswordPageHtml(error: "Invalid or expired reset link. Please request a new password reset."), "text/html");
        }
        return Content(AuthHtmlHelper.GetResetPasswordPageHtml(email: email, code: code), "text/html");
    }

    /// <summary>Submit a new password using the token from the reset email.</summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
    {
        var dto = new ResetPasswordDto
        {
            Email = model.Email,
            Token = model.Token,
            NewPassword = model.NewPassword,
            ConfirmPassword = model.ConfirmPassword
        };
        var response = await _userService.ResetPasswordAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Enable biometric authentication for the current user. Returns a long-lived biometric token.</summary>
    [HttpPost("biometric/setup")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BiometricSetup()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _loginService.SetupBiometricAsync(userId));
    }

    /// <summary>Login using a biometric token. Validates the token and returns fresh access + refresh tokens.</summary>
    [HttpPost("biometric/login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BiometricLogin([FromBody] BiometricLoginViewModel model)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        return ToActionResult(await _loginService.BiometricLoginAsync(model.BiometricToken));
    }

    /// <summary>Disable biometric authentication for the current user. Revokes all biometric tokens.</summary>
    [HttpDelete("biometric/disable")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BiometricDisable()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _loginService.DisableBiometricAsync(userId));
    }
}
