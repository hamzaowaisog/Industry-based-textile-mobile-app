using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Manages the per-user notification inbox. Notifications are created server-side and pushed to devices via FCM.</summary>
public interface INotificationService
{
    /// <summary>Create a notification for a user and fan-out an FCM push to all their devices.</summary>
    Task<Response<NotificationDto>> CreateAsync(CreateNotificationDto dto);

    /// <summary>Creates and pushes a notification to every Admin (RoleId = 1) user.</summary>
    Task CreateForAdminsAsync(string type, string title, string body, int? entityId = null);

    /// <summary>Get all notifications for a user, optionally filtered to unread only.</summary>
    Task<Response<List<NotificationDto>>> GetAllAsync(int userId, bool unreadOnly = false, int? limit = null);

    /// <summary>Get the count of unread notifications for a user.</summary>
    Task<Response<UnreadCountDto>> GetUnreadCountAsync(int userId);

    /// <summary>Mark a single notification as read.</summary>
    Task<Response> MarkAsReadAsync(int id, int userId);

    /// <summary>Mark all notifications for a user as read.</summary>
    Task<Response> MarkAllReadAsync(int userId);

    /// <summary>Delete a single notification.</summary>
    Task<Response> DeleteAsync(int id, int userId);
}

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IPushNotificationService _push;

    public NotificationService(ApplicationDbContext db, IPushNotificationService push)
    {
        _db = db;
        _push = push;
    }

    public async Task<Response<NotificationDto>> CreateAsync(CreateNotificationDto dto)
    {
        var entity = new Notification
        {
            UserId = dto.UserId,
            Type = dto.Type,
            Title = dto.Title,
            Body = dto.Body,
            EntityId = dto.EntityId,
            IsRead = false,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
        };

        await _db.Notifications.AddAsync(entity);
        await _db.SaveChangesAsync();

        var vars = new Dictionary<string, string>
        {
            ["title"] = dto.Title,
            ["body"] = dto.Body,
        };
        if (dto.EntityId.HasValue)
            vars["entityId"] = dto.EntityId.Value.ToString();

        await _push.SendToUserAsync(dto.UserId, dto.Title, dto.Body, new Dictionary<string, string>
        {
            ["type"] = dto.Type,
            ["title"] = dto.Title,
            ["body"] = dto.Body,
            ["entityId"] = dto.EntityId?.ToString() ?? "",
            ["timestamp"] = DateTime.UtcNow.ToString("O"),
        });

        return Response<NotificationDto>.SuccessResponse(ToDto(entity), "Notification created.");
    }

    public async Task CreateForAdminsAsync(string type, string title, string body, int? entityId = null)
    {
        var adminIds = await _db.Users.Where(u => u.RoleId == 1).Select(u => u.Id).ToListAsync();

        foreach (var adminId in adminIds)
        {
            try
            {
                await CreateAsync(new CreateNotificationDto
                {
                    UserId = adminId,
                    Type = type,
                    Title = title,
                    Body = body,
                    EntityId = entityId
                });
            }
            catch
            {
                // per-recipient failure must not block the rest of the fan-out
            }
        }
    }

    public async Task<Response<List<NotificationDto>>> GetAllAsync(int userId, bool unreadOnly = false, int? limit = null)
    {
        var query = _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        query = query.OrderByDescending(n => n.CreatedAt);

        if (limit.HasValue)
            query = query.Take(limit.Value);

        var list = await query.ToListAsync();
        return Response<List<NotificationDto>>.SuccessResponse(list.Select(ToDto).ToList(), "Notifications fetched.");
    }

    public async Task<Response<UnreadCountDto>> GetUnreadCountAsync(int userId)
    {
        var count = await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        return Response<UnreadCountDto>.SuccessResponse(new UnreadCountDto { Count = count }, "Unread count fetched.");
    }

    public async Task<Response> MarkAsReadAsync(int id, int userId)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (n is null) return Response.ErrorResponse("Not found", $"Notification {id} not found.");
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return Response.SuccessResponse("Marked as read.");
    }

    public async Task<Response> MarkAllReadAsync(int userId)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return Response.SuccessResponse("All notifications marked as read.");
    }

    public async Task<Response> DeleteAsync(int id, int userId)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (n is null) return Response.ErrorResponse("Not found", $"Notification {id} not found.");
        _db.Notifications.Remove(n);
        await _db.SaveChangesAsync();
        return Response.SuccessResponse("Notification deleted.");
    }

    private static NotificationDto ToDto(Notification n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        Type = n.Type,
        Title = n.Title,
        Body = n.Body,
        EntityId = n.EntityId,
        IsRead = n.IsRead,
        CreatedAt = DateTime.SpecifyKind(n.CreatedAt, DateTimeKind.Utc),
    };
}
