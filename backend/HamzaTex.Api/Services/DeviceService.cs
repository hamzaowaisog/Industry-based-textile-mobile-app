using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Manages FCM device token registration and deregistration for push notification delivery.</summary>
public interface IDeviceService
{
    /// <summary>Register or refresh a device token for the authenticated user. Prunes oldest tokens if the user exceeds 3 active tokens per device type.</summary>
    Task<Response> RegisterAsync(RegisterDeviceDto dto, int userId);

    /// <summary>Mark a specific push token as inactive for the given user.</summary>
    Task<Response> UnregisterAsync(string pushToken, int userId);

    /// <summary>Mark all push tokens for the given user as inactive (used on logout-all).</summary>
    Task<Response> UnregisterAllAsync(int userId);
}

public class DeviceService : IDeviceService
{
    private readonly ApplicationDbContext _db;

    public DeviceService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Response> RegisterAsync(RegisterDeviceDto dto, int userId)
    {
        var existing = await _db.DeviceTokens
            .FirstOrDefaultAsync(t => t.PushToken == dto.PushToken && t.UserId == userId);

        if (existing is not null)
        {
            existing.LastUsedAt = DateTime.UtcNow;
            existing.IsActive = true;
            if (dto.AppVersion is not null) existing.AppVersion = dto.AppVersion;
            await _db.SaveChangesAsync();
            return Response.SuccessResponse("Device token refreshed.");
        }

        // Prune oldest beyond 3 active tokens per device type
        var activeTokens = await _db.DeviceTokens
            .Where(t => t.UserId == userId && t.DeviceType == dto.DeviceType && t.IsActive)
            .OrderBy(t => t.RegisteredAt)
            .ToListAsync();

        if (activeTokens.Count >= 3)
        {
            var oldest = activeTokens.First();
            oldest.IsActive = false;
        }

        _db.DeviceTokens.Add(new DeviceToken
        {
            UserId = userId,
            PushToken = dto.PushToken,
            DeviceType = dto.DeviceType,
            AppVersion = dto.AppVersion,
            RegisteredAt = DateTime.UtcNow,
            IsActive = true
        });

        await _db.SaveChangesAsync();
        return Response.SuccessResponse("Device registered.");
    }

    public async Task<Response> UnregisterAsync(string pushToken, int userId)
    {
        var token = await _db.DeviceTokens
            .FirstOrDefaultAsync(t => t.PushToken == pushToken && t.UserId == userId);

        if (token is null)
            return Response.SuccessResponse("Token not found, nothing to unregister.");

        token.IsActive = false;
        await _db.SaveChangesAsync();
        return Response.SuccessResponse("Device unregistered.");
    }

    public async Task<Response> UnregisterAllAsync(int userId)
    {
        var tokens = await _db.DeviceTokens
            .Where(t => t.UserId == userId && t.IsActive)
            .ToListAsync();

        foreach (var t in tokens)
            t.IsActive = false;

        await _db.SaveChangesAsync();
        return Response.SuccessResponse("All devices unregistered.");
    }
}
