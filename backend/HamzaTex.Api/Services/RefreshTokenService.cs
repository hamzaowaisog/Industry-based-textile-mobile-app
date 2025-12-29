using System.Security.Cryptography;
using System.Text;
using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IRefreshTokenService
{
    Task<(RefreshToken Entity, string PlainToken)> CreateRefreshTokenAsync(int userId, string? ipAddress = null);
    Task<RefreshToken?> GetRefreshTokenByTokenAsync(string token);
    Task RevokeRefreshTokenAsync(string token, string? ipAddress = null);
    Task RevokeAllUserTokensAsync(int userId, string? ipAddress = null);
    Task<bool> IsRefreshTokenValidAsync(string token);
    Task CleanupExpiredTokensAsync();
}

public class RefreshTokenService : IRefreshTokenService
{
    private readonly ApplicationDbContext _dbContext;

    public RefreshTokenService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(RefreshToken Entity, string PlainToken)> CreateRefreshTokenAsync(int userId, string? ipAddress = null)
    {
        var plainToken = JwtHelper.GenerateRefreshToken();
        
        var hashedToken = HashToken(plainToken);
        
        var refreshToken = new RefreshToken
        {
            Token = hashedToken,
            UserId = userId,
            ExpiresAt = JwtHelper.GetRefreshTokenExpiration(),
            CreatedAt = DateTime.UtcNow,
            RevokedAt = null,
            RevokedByIp = null,
            ReplacedByToken = null
        };

        await _dbContext.RefreshTokens.AddAsync(refreshToken);
        await _dbContext.SaveChangesAsync();

        return (refreshToken, plainToken);
    }

    public async Task<RefreshToken?> GetRefreshTokenByTokenAsync(string token)
    {
        var hashedToken = HashToken(token);
        
        var refreshToken = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken);

        return refreshToken;
    }

    public async Task RevokeRefreshTokenAsync(string token, string? ipAddress = null)
    {
        var refreshToken = await GetRefreshTokenByTokenAsync(token);
        
        if (refreshToken == null)
        {
            return;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;

        await _dbContext.SaveChangesAsync();
    }

    public async Task RevokeAllUserTokensAsync(int userId, string? ipAddress = null)
    {
        var revokedAt = DateTime.UtcNow;
        var activeTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync();

        if (activeTokens.Count == 0)
        {
            return;
        }

        foreach (var token in activeTokens)
        {
            token.RevokedAt = revokedAt;
            token.RevokedByIp = ipAddress;
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> IsRefreshTokenValidAsync(string token)
    {
        var refreshToken = await GetRefreshTokenByTokenAsync(token);
        
        if (refreshToken == null)
        {
            return false; 
        }

        if (!refreshToken.IsActive)
        {
            return false;
        }

        if (refreshToken.User != null && !refreshToken.User.IsActive)
        {
            return false;
        }

        return true;
    }

    public async Task CleanupExpiredTokensAsync()
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-7);
        
        var tokensToDelete = await _dbContext.RefreshTokens
            .Where(rt => 
                rt.ExpiresAt < DateTime.UtcNow || 
                (rt.RevokedAt != null && rt.RevokedAt < cutoffDate))
            .ToListAsync();

        _dbContext.RefreshTokens.RemoveRange(tokensToDelete);
        await _dbContext.SaveChangesAsync();
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}