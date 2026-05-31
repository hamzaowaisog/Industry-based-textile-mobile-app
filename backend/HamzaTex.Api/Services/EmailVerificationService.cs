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

/// <summary>OTP-based email verification for new user signup — send code, verify code.</summary>
public interface IEmailVerificationService
{
    /// <summary>Generate a 6-digit OTP and email it to the user. Enforces a 30-second resend cooldown per email.</summary>
    Task<Response<SignupOtpResponseDto>> SendOtpAsync(string email);
    /// <summary>Verify the 6-digit OTP and mark the user's email as confirmed. Max 5 failed attempts before code is invalidated.</summary>
    Task<Response> VerifyOtpAsync(VerifySignupOtpDto model);
}

public class EmailVerificationService : IEmailVerificationService
{
    private const int OtpExpiryMinutes = 15;
    private const int ResendCooldownSeconds = 30;
    private const int MaxAttempts = 5;

    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<EmailVerificationService> _logger;

    public EmailVerificationService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IEmailSender emailSender,
        ILogger<EmailVerificationService> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<Response<SignupOtpResponseDto>> SendOtpAsync(string email)
    {
        // Enforce 30-second resend cooldown
        var latest = await _dbContext.EmailVerificationOtps
            .Where(o => o.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (latest is not null && DateTime.UtcNow < latest.NextResendAt)
        {
            var wait = (int)(latest.NextResendAt - DateTime.UtcNow).TotalSeconds;
            return Response<SignupOtpResponseDto>.ErrorResponse(
                "Too many requests",
                $"Please wait {wait} second(s) before requesting a new code.");
        }

        // Wipe stale OTPs before issuing a fresh one
        var stale = await _dbContext.EmailVerificationOtps.Where(o => o.Email == email).ToListAsync();
        _dbContext.EmailVerificationOtps.RemoveRange(stale);

        var code = Random.Shared.Next(100000, 999999).ToString();
        var now = DateTime.UtcNow;

        var otp = new EmailVerificationOtp
        {
            Email = email,
            CodeHash = Hash(code),
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(OtpExpiryMinutes),
            NextResendAt = now.AddSeconds(ResendCooldownSeconds),
        };

        _dbContext.EmailVerificationOtps.Add(otp);
        await _dbContext.SaveChangesAsync();

        var htmlMessage = AuthHtmlHelper.GetOtpEmailHtml(code, OtpExpiryMinutes.ToString(),
            heading: "Email Verification Code",
            bodyText: "Use the code below to verify your email address and activate your Hamza Tex account.");
        try
        {
            await _emailSender.SendEmailAsync(email, "Verify your email", htmlMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Verification email failed for {Email}", email);
        }

        return Response<SignupOtpResponseDto>.SuccessResponse(
            new SignupOtpResponseDto { NextResendAt = otp.NextResendAt },
            "Verification code sent. Please check your email.");
    }

    public async Task<Response> VerifyOtpAsync(VerifySignupOtpDto model)
    {
        var otp = await _dbContext.EmailVerificationOtps
            .Where(o => o.Email == model.Email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
            return Response.ErrorResponse("Not found", "No pending verification code for this email.");

        if (DateTime.UtcNow > otp.ExpiresAt)
        {
            _dbContext.EmailVerificationOtps.Remove(otp);
            await _dbContext.SaveChangesAsync();
            return Response.ErrorResponse("Code expired", "Your verification code has expired. Please request a new one.");
        }

        if (otp.AttemptCount >= MaxAttempts)
            return Response.ErrorResponse("Too many attempts", "Maximum verification attempts exceeded. Please request a new code.");

        otp.AttemptCount++;

        if (Hash(model.Code) != otp.CodeHash)
        {
            await _dbContext.SaveChangesAsync();
            var remaining = MaxAttempts - otp.AttemptCount;
            var hint = remaining > 0
                ? $"Incorrect code. {remaining} attempt(s) remaining."
                : "Incorrect code. Maximum attempts exceeded — please request a new code.";
            return Response.ErrorResponse("Invalid code", hint);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null)
            return Response.ErrorResponse("Not found", "User account not found.");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmResult = await _userManager.ConfirmEmailAsync(user, token);
        if (!confirmResult.Succeeded)
            return Response.ErrorResponse("Confirmation failed", string.Join(", ", confirmResult.Errors.Select(e => e.Description)));

        otp.IsUsed = true;
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Email verified successfully. You can now sign in.");
    }

    private static string Hash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
