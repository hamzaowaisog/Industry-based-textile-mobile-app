using System.Security.Cryptography;
using System.Text;
using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>OTP-based password reset — send code, verify code, reset password.</summary>
public interface IPasswordResetService
{
    /// <summary>Generate a 6-digit OTP and email it to the user. Enforces a 30-second resend cooldown per email.</summary>
    Task<Response<SendOtpResponseDto>> SendOtpAsync(string email);
    /// <summary>Verify the 6-digit OTP. Returns a short-lived reset token on success. Max 5 failed attempts before code is invalidated.</summary>
    Task<Response<VerifyOtpResponseDto>> VerifyOtpAsync(VerifyOtpDto model);
    /// <summary>Reset the user's password using the reset token issued after OTP verification. Token expires in 10 minutes and is single-use.</summary>
    Task<Response> ResetPasswordAsync(ResetPasswordWithTokenDto model);
}

public class PasswordResetService : IPasswordResetService
{
    private const int OtpExpiryMinutes = 15;
    private const int ResendCooldownSeconds = 30;
    private const int MaxAttempts = 5;
    private const int ResetTokenExpiryMinutes = 10;

    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IRefreshTokenService refreshTokenService,
        IEmailSender emailSender,
        ILogger<PasswordResetService> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _refreshTokenService = refreshTokenService;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<Response<SendOtpResponseDto>> SendOtpAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);

        // Respond identically whether user exists or not — prevents email enumeration
        if (user is null)
            return Response<SendOtpResponseDto>.SuccessResponse(
                new SendOtpResponseDto { NextResendAt = DateTime.UtcNow.AddSeconds(ResendCooldownSeconds) },
                "If this email is registered, a verification code has been sent.");

        // Enforce 30-second resend cooldown
        var latest = await _dbContext.PasswordResetOtps
            .Where(o => o.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (latest is not null)
        {
            var nextResendAt = latest.CreatedAt.AddSeconds(ResendCooldownSeconds);
            if (DateTime.UtcNow < nextResendAt)
                return Response<SendOtpResponseDto>.ErrorResponse(
                    "Too many requests",
                    $"Please wait {(int)(nextResendAt - DateTime.UtcNow).TotalSeconds} second(s) before requesting a new code.");
        }

        // Wipe all previous OTPs for this email before issuing a fresh one
        var stale = await _dbContext.PasswordResetOtps.Where(o => o.Email == email).ToListAsync();
        _dbContext.PasswordResetOtps.RemoveRange(stale);

        // 6-digit code stored as SHA-256 hash
        var code = Random.Shared.Next(100_000, 1_000_000).ToString();
        var now = DateTime.UtcNow;

        var otp = new PasswordResetOtp
        {
            Email = email,
            CodeHash = Hash(code),
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(OtpExpiryMinutes),
        };
        _dbContext.PasswordResetOtps.Add(otp);
        await _dbContext.SaveChangesAsync();

        try
        {
            var html = AuthHtmlHelper.GetOtpEmailHtml(code, OtpExpiryMinutes.ToString());
            await _emailSender.SendEmailAsync(user.Email!, "Your Password Reset Code", html);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OTP email failed for {Email}", email);
            return Response<SendOtpResponseDto>.ErrorResponse(
                "Email send failed",
                "Could not send the verification code. Please check SMTP settings or try again later.");
        }

        return Response<SendOtpResponseDto>.SuccessResponse(
            new SendOtpResponseDto { NextResendAt = now.AddSeconds(ResendCooldownSeconds) },
            "Verification code sent. Please check your email.");
    }

    public async Task<Response<VerifyOtpResponseDto>> VerifyOtpAsync(VerifyOtpDto model)
    {
        var otp = await _dbContext.PasswordResetOtps
            .Where(o => o.Email == model.Email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
            return Response<VerifyOtpResponseDto>.ErrorResponse(
                "Invalid code",
                "No active verification code found for this email. Please request a new one.");

        if (DateTime.UtcNow > otp.ExpiresAt)
        {
            _dbContext.PasswordResetOtps.Remove(otp);
            await _dbContext.SaveChangesAsync();
            return Response<VerifyOtpResponseDto>.ErrorResponse(
                "Code expired",
                "Your verification code has expired. Please request a new one.");
        }

        if (otp.AttemptCount >= MaxAttempts)
            return Response<VerifyOtpResponseDto>.ErrorResponse(
                "Too many attempts",
                "Maximum verification attempts exceeded. Please request a new code.");

        otp.AttemptCount++;

        if (Hash(model.Code) != otp.CodeHash)
        {
            await _dbContext.SaveChangesAsync();
            var remaining = MaxAttempts - otp.AttemptCount;
            var hint = remaining > 0
                ? $"Incorrect code. {remaining} attempt(s) remaining."
                : "Incorrect code. Maximum attempts exceeded — please request a new code.";
            return Response<VerifyOtpResponseDto>.ErrorResponse("Invalid code", hint);
        }

        // Code is correct — issue a single-use reset token (two GUIDs = 64 hex chars of entropy)
        var rawToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        otp.ResetTokenHash = Hash(rawToken);
        otp.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(ResetTokenExpiryMinutes);
        await _dbContext.SaveChangesAsync();

        return Response<VerifyOtpResponseDto>.SuccessResponse(
            new VerifyOtpResponseDto { ResetToken = rawToken },
            "Code verified. You may now set a new password.");
    }

    public async Task<Response> ResetPasswordAsync(ResetPasswordWithTokenDto model)
    {
        if (model.NewPassword != model.ConfirmPassword)
            return Response.ErrorResponse("Validation failed", "Passwords do not match.");

        var tokenHash = Hash(model.ResetToken);
        var otp = await _dbContext.PasswordResetOtps
            .FirstOrDefaultAsync(o => o.ResetTokenHash == tokenHash && !o.IsUsed);

        // Cross-validate that the submitted email matches the OTP record
        if (otp is not null && !string.Equals(otp.Email, model.Email.Trim(), StringComparison.OrdinalIgnoreCase))
            otp = null;

        if (otp is null)
            return Response.ErrorResponse("Invalid token", "Invalid or already used reset token.");

        if (otp.ResetTokenExpiresAt is null || DateTime.UtcNow > otp.ResetTokenExpiresAt)
            return Response.ErrorResponse("Token expired", "Your reset session has expired. Please start over.");

        var user = await _userManager.FindByEmailAsync(otp.Email);
        if (user is null)
            return Response.ErrorResponse("Not found", "User account not found.");

        // Use Identity's token pipeline so it handles hashing and security stamp rotation
        var identityToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, identityToken, model.NewPassword);

        if (!result.Succeeded)
            return Response.ErrorResponse("Validation failed", string.Join(", ", result.Errors.Select(e => e.Description)));

        // Revoke all active sessions so every device is signed out after a password reset
        await _refreshTokenService.RevokeAllUserTokensAsync(user.Id, "password-reset");

        otp.IsUsed = true;
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Password reset successfully. You can now sign in with your new password.");
    }

    private static string Hash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
