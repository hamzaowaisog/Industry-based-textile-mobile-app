using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface ILoginService
{
    Task<Response<LoginResponseDto>> LoginAsync(LoginDto model);
}

public class LoginService : ILoginService
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public LoginService(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager)
    {
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
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
        var refreshToken = JwtHelper.GenerateRefreshToken();

        return Response<LoginResponseDto>.SuccessResponse(new LoginResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            RoleId = user.RoleId.Value, 
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = JwtHelper.GetTokenExpiration(),
            RefreshTokenExpiresAt = JwtHelper.GetRefreshTokenExpiration()
        });
    }
}