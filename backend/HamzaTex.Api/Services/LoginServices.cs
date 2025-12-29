using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface ILoginService
{
    Task<Response<LoginResponseDto>> LoginAsync(LoginDto model);
    Task<Response<LoginResponseDto>> RefreshTokenAsync(string refreshToken);
    Task<Response> LogoutAsync(string refreshToken);
    Task<Response> LogoutAllAsync(int userId);
}

public class LoginService : ILoginService
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRefreshTokenService _refreshTokenService;

    public LoginService(
        SignInManager<ApplicationUser> signInManager, 
        UserManager<ApplicationUser> userManager,
        IRefreshTokenService refreshTokenService)
    {
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
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
        
        var (refreshTokenEntity, plainRefreshToken) = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id, 
            null // IP address can be passed from HttpContext if needed
        );

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

        await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);

        var newAccessToken = JwtHelper.GenerateToken(user.Id, user.Email, user.RoleId.Value);

        var (newRefreshTokenEntity, newPlainRefreshToken) = await _refreshTokenService.CreateRefreshTokenAsync(
            user.Id,
            null
        );

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

    public async Task<Response> LogoutAsync(string refreshToken)
    {
        await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);

        return Response.SuccessResponse("Logged out successfully");
    }

    public async Task<Response> LogoutAllAsync(int userId)
    {
        await _refreshTokenService.RevokeAllUserTokensAsync(userId);

        return Response.SuccessResponse("Logged out from all devices successfully");
    }
}