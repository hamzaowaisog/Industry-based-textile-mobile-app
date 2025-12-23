using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HamzaTex.Api.Helpers;

public static class JwtHelper
{
    private static string? _secretKey;
    private static string? _issuer;
    private static string? _audience;
    private static int _tokenExpirationMinutes = 60;
    private static int _refreshTokenExpirationDays = 7;

    public static void Configure(IConfiguration configuration)
    {
        _secretKey = configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
        _issuer = configuration["Jwt:Issuer"] ?? "HamzaTex.Api";
        _audience = configuration["Jwt:Audience"] ?? "HamzaTex.Client";
        _tokenExpirationMinutes = int.Parse(configuration["Jwt:TokenExpirationMinutes"] ?? "60");
        _refreshTokenExpirationDays = int.Parse(configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
    }

    private static string SecretKey => _secretKey ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
    private static string Issuer => _issuer ?? "HamzaTex.Api";
    private static string Audience => _audience ?? "HamzaTex.Client";
    private static int TokenExpirationMinutes => _tokenExpirationMinutes;
    private static int RefreshTokenExpirationDays => _refreshTokenExpirationDays;

    public static string GenerateToken(int userId, string? email = null, int? roleId = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        };

        if (!string.IsNullOrEmpty(email))
        {
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        if (roleId.HasValue)
        {
            claims.Add(new Claim("RoleId", roleId.Value.ToString()));
            claims.Add(new Claim(ClaimTypes.Role, roleId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_tokenExpirationMinutes),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public static DateTime GetTokenExpiration()
    {
        return DateTime.UtcNow.AddMinutes(_tokenExpirationMinutes);
    }

    public static DateTime GetRefreshTokenExpiration()
    {
        return DateTime.UtcNow.AddDays(_refreshTokenExpirationDays);
    }

    public static string GetSecretKey() => SecretKey;
    public static string GetIssuer() => Issuer;
    public static string GetAudience() => Audience;
}

