using BCrypt.Net;
using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface ILoginService {
    Task<Response<LoginResponseDto>> LoginAsync (LoginDto model);
}

public class LoginService : ILoginService {
    private readonly ApplicationDbContext _dbContext;

    public LoginService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<LoginResponseDto>> LoginAsync (LoginDto model){
        var username = model.UserName.Trim();
        var password = model.Password.Trim();

        var user = await _dbContext.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserName == username);
            
        if (user is null) {
            return Response<LoginResponseDto>.ErrorResponse("Invalid username or password");
        }
        
        if (string.IsNullOrEmpty(user.Password))
        {
            return Response<LoginResponseDto>.ErrorResponse("Invalid username or password");
        }
        
        var isValidPassword = BCrypt.Net.BCrypt.Verify(password, user.Password);
        if (!isValidPassword) {
            return Response<LoginResponseDto>.ErrorResponse("Invalid username or password");
        }
        
        if (!user.RoleId.HasValue)
        {
            return Response<LoginResponseDto>.ErrorResponse("User role is not assigned. Please contact administrator.");
        }
        
        if (!user.IsActive)
        {
            return Response<LoginResponseDto>.ErrorResponse("User account is inactive. Please contact administrator.");
        }
        
        var token = JwtHelper.GenerateToken(user.Id, user.Email, user.RoleId.Value);
        var refreshToken = JwtHelper.GenerateRefreshToken();
        
        return Response<LoginResponseDto>.SuccessResponse(new LoginResponseDto {
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