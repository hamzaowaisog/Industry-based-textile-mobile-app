using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Authentication — login, token refresh, and logout.</summary>
public interface ILoginService
{
    /// <summary>Validate credentials and return a JWT access token + refresh token.</summary>
    Task<Response<LoginResponseDto>> LoginAsync(LoginDto model);
    /// <summary>Exchange a valid refresh token for a new access token and rotated refresh token.</summary>
    Task<Response<LoginResponseDto>> RefreshTokenAsync(string refreshToken);
    /// <summary>Revoke a specific refresh token and deregister the device's push token (logout current device).</summary>
    Task<Response> LogoutAsync(string refreshToken, int userId, string? pushToken = null);
    /// <summary>Revoke all refresh tokens and deregister all push tokens for a user (logout all devices).</summary>
    Task<Response> LogoutAllAsync(int userId);
    /// <summary>Create a long-lived biometric token for the user (replaces any existing one).</summary>
    Task<Response<BiometricSetupResponseDto>> SetupBiometricAsync(int userId);
    /// <summary>Validate a biometric token and return fresh access + refresh tokens.</summary>
    Task<Response<LoginResponseDto>> BiometricLoginAsync(string biometricToken);
    /// <summary>Revoke all biometric tokens for a user.</summary>
    Task<Response> DisableBiometricAsync(int userId);
}

public class LoginService : ILoginService
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IDeviceService _deviceService;

    public LoginService(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        IRefreshTokenService refreshTokenService,
        IHttpContextAccessor httpContextAccessor,
        IDeviceService deviceService)
    {
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _deviceService = deviceService;
    }

    private string GetClientIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return string.Empty;
        }
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            var ip = forwardedFor.Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(ip))
            {
                return ip;
            }
        }

        var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        var remoteIp = httpContext.Connection.RemoteIpAddress;
        if (remoteIp != null)
        {
            if (remoteIp.ToString() == "::1")
            {
                return "127.0.0.1";
            }
            return remoteIp.ToString();
        }

        return string.Empty;
    }

    public async Task<Response<LoginResponseDto>> LoginAsync(LoginDto model)
    {
        var username = model.UserName.Trim();
        var password = model.Password.Trim();

        var user = await _userManager.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserName == username);

        if (user is null)
        {
            return Response<LoginResponseDto>.ErrorResponse("Invalid username or password");
        }

        if (!user.IsActive)
        {
            return Response<LoginResponseDto>.ErrorResponse("User account is inactive. Please contact administrator.");
        }

        if (!user.RoleId.HasValue)
        {
            return Response<LoginResponseDto>.ErrorResponse("User role is not assigned. Please contact administrator.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return Response<LoginResponseDto>.ErrorResponse("User account is locked out. Please try again later.");
            }

            if (result.IsNotAllowed)
            {
                return Response<LoginResponseDto>.ErrorResponse("User account is not allowed to sign in. Please contact administrator.");
            }

            return Response<LoginResponseDto>.ErrorResponse("Invalid username or password");
        }

        var token = JwtHelper.GenerateToken(user.Id, user.Email, user.RoleId.Value);

        var ipAddress = GetClientIpAddress();
        var (refreshTokenEntity, plainRefreshToken) = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id, 
            ipAddress
        );

        if (refreshTokenEntity == null || plainRefreshToken == null){
            await LogoutAllAsync(user.Id);
            return Response<LoginResponseDto>.ErrorResponse("You are logged out. Please login again.");
        }

        return Response<LoginResponseDto>.SuccessResponse(new LoginResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            RoleId = user.RoleId.Value, 
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = token,
            RefreshToken = plainRefreshToken,
            ExpiresAt = JwtHelper.GetTokenExpiration(),
            RefreshTokenExpiresAt = refreshTokenEntity.ExpiresAt
        });
    }

    public async Task<Response<LoginResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        var isValid = await _refreshTokenService.IsRefreshTokenValidAsync(refreshToken);
        if (!isValid)
        {
            return Response<LoginResponseDto>.ErrorResponse("Invalid or expired refresh token");
        }

        var refreshTokenEntity = await _refreshTokenService.GetRefreshTokenByTokenAsync(refreshToken);
        if (refreshTokenEntity == null || refreshTokenEntity.User == null)
        {
            return Response<LoginResponseDto>.ErrorResponse("Refresh token not found");
        }

        var user = refreshTokenEntity.User;

        if (!user.IsActive)
        {
            return Response<LoginResponseDto>.ErrorResponse("User account is inactive");
        }

        if (!user.RoleId.HasValue)
        {
            return Response<LoginResponseDto>.ErrorResponse("User role is not assigned");
        }

        var ipAddress = GetClientIpAddress();
        await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress);

        var newAccessToken = JwtHelper.GenerateToken(user.Id, user.Email, user.RoleId.Value);

        var (newRefreshTokenEntity, newPlainRefreshToken) = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id,
            ipAddress
        );

        if (newRefreshTokenEntity == null || newPlainRefreshToken == null)
        {
            return Response<LoginResponseDto>.ErrorResponse("Failed to create refresh token. Please try again.");
        }

        return Response<LoginResponseDto>.SuccessResponse(new LoginResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            RoleId = user.RoleId.Value,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = newAccessToken,
            RefreshToken = newPlainRefreshToken,
            ExpiresAt = JwtHelper.GetTokenExpiration(),
            RefreshTokenExpiresAt = newRefreshTokenEntity.ExpiresAt
        });
    }

    public async Task<Response> LogoutAsync(string refreshToken, int userId, string? pushToken = null)
    {
        var ipAddress = GetClientIpAddress();
        await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken, ipAddress);

        if (!string.IsNullOrWhiteSpace(pushToken))
            await _deviceService.UnregisterAsync(pushToken, userId);

        return Response.SuccessResponse("Logged out successfully");
    }

    public async Task<Response> LogoutAllAsync(int userId)
    {
        var ipAddress = GetClientIpAddress();
        await _refreshTokenService.RevokeAllUserTokensAsync(userId, ipAddress);
        await _deviceService.UnregisterAllAsync(userId);

        return Response.SuccessResponse("Logged out from all devices successfully");
    }

    public async Task<Response<BiometricSetupResponseDto>> SetupBiometricAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return Response<BiometricSetupResponseDto>.ErrorResponse("User not found");

        if (!user.IsActive)
            return Response<BiometricSetupResponseDto>.ErrorResponse("User account is inactive");

        var ipAddress = GetClientIpAddress();
        var (entity, plainToken) = await _refreshTokenService.CreateBiometricTokenAsync(userId, ipAddress);

        if (entity == null || plainToken == null)
            return Response<BiometricSetupResponseDto>.ErrorResponse("Failed to create biometric token");

        return Response<BiometricSetupResponseDto>.SuccessResponse(
            new BiometricSetupResponseDto
            {
                BiometricToken = plainToken,
                ExpiresAt = entity.ExpiresAt
            }, "Biometric authentication enabled");
    }

    public async Task<Response<LoginResponseDto>> BiometricLoginAsync(string biometricToken)
    {
        var tokenEntity = await _refreshTokenService.GetRefreshTokenByTokenAsync(biometricToken);

        if (tokenEntity == null)
            return Response<LoginResponseDto>.ErrorResponse("Invalid biometric token");

        if (!tokenEntity.IsBiometric)
            return Response<LoginResponseDto>.ErrorResponse("Invalid biometric token");

        if (!tokenEntity.IsActive)
            return Response<LoginResponseDto>.ErrorResponse("Biometric token has been revoked");

        if (tokenEntity.IsExpired)
            return Response<LoginResponseDto>.ErrorResponse("Biometric token has expired. Please log in with your password and re-enable biometrics.");

        var user = tokenEntity.User;

        if (!user.IsActive)
            return Response<LoginResponseDto>.ErrorResponse("User account is inactive");

        if (!user.RoleId.HasValue)
            return Response<LoginResponseDto>.ErrorResponse("User role is not assigned");

        var ipAddress = GetClientIpAddress();

        // Revoke old biometric token (rotation)
        await _refreshTokenService.RevokeRefreshTokenAsync(biometricToken, ipAddress);

        // Generate new JWT access token
        var accessToken = JwtHelper.GenerateToken(user.Id, user.Email, user.RoleId.Value);

        // Create new rotated biometric token
        var (newBiometricEntity, newBiometricToken) = await _refreshTokenService.CreateBiometricTokenAsync(user.Id, ipAddress);
        if (newBiometricEntity == null || newBiometricToken == null)
            return Response<LoginResponseDto>.ErrorResponse("Failed to create biometric token");

        // Create a regular refresh token so the frontend can refresh the JWT without biometric
        var (newRefreshEntity, newRefreshToken) = await _refreshTokenService.CreateRefreshTokenAsync(user.Id, ipAddress);
        if (newRefreshEntity == null || newRefreshToken == null)
            return Response<LoginResponseDto>.ErrorResponse("Failed to create refresh token");

        return Response<LoginResponseDto>.SuccessResponse(new LoginResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            RoleId = user.RoleId.Value,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = accessToken,
            RefreshToken = newRefreshToken,
            BiometricToken = newBiometricToken,
            ExpiresAt = JwtHelper.GetTokenExpiration(),
            RefreshTokenExpiresAt = newRefreshEntity.ExpiresAt
        });
    }

    public async Task<Response> DisableBiometricAsync(int userId)
    {
        var ipAddress = GetClientIpAddress();
        await _refreshTokenService.RevokeBiometricTokensAsync(userId, ipAddress);
        return Response.SuccessResponse("Biometric authentication disabled");
    }
}