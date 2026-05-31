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
    private readonly IPasswordResetService _passwordResetService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(
        IUserService userService,
        ILoginService loginService,
        IChangePasswordService changePasswordService,
        IPasswordResetService passwordResetService,
        IEmailVerificationService emailVerificationService,
        UserManager<ApplicationUser> userManager)
    {
        _userService = userService;
        _loginService = loginService;
        _changePasswordService = changePasswordService;
        _passwordResetService = passwordResetService;
        _emailVerificationService = emailVerificationService;
        _userManager = userManager;
    }

    /// <summary>Register a new user account. Creates a Staff user and sends a 6-digit email verification OTP.</summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
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
            RoleId = 2,
            IsActive = true,
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

    /// <summary>Verify the 6-digit email verification code sent during signup. Marks email as confirmed on success.</summary>
    [HttpPost("verify-signup-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifySignupOtp([FromBody] VerifySignupOtpViewModel model)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var dto = new VerifySignupOtpDto { Email = model.Email, Code = model.Code };
        var response = await _emailVerificationService.VerifyOtpAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Resend the signup email verification OTP. Enforces a 30-second cooldown between requests.</summary>
    [HttpPost("resend-signup-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResendSignupOtp([FromBody] ResendSignupOtpViewModel model)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var response = await _emailVerificationService.SendOtpAsync(model.Email);
        return ToActionResult(response);
    }

    /// <summary>Send a 6-digit OTP to the given email address. Enforces a 30-second resend cooldown.</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ToValidationResponseFromModelState<SendOtpResponseDto>());
        var response = await _passwordResetService.SendOtpAsync(model.Email);
        return ToActionResult(response);
    }

    /// <summary>Verify the 6-digit OTP. Returns a short-lived reset token on success.</summary>
    [HttpPost("verify-reset-otp")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyOtpViewModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ToValidationResponseFromModelState<VerifyOtpResponseDto>());
        var dto = new VerifyOtpDto { Email = model.Email, Code = model.Code };
        var response = await _passwordResetService.VerifyOtpAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Reset the user's password using the reset token obtained from OTP verification.</summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithTokenViewModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ToValidationResponseFromModelState<object>());
        var dto = new ResetPasswordWithTokenDto
        {
            Email = model.Email,
            ResetToken = model.ResetToken,
            NewPassword = model.NewPassword,
            ConfirmPassword = model.ConfirmPassword
        };
        var response = await _passwordResetService.ResetPasswordAsync(dto);
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
