using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Per-user notification inbox. Notifications are created server-side; clients read and manage their own inbox.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class NotificationController : BaseController
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>Get all notifications for the current user. Pass unreadOnly=true and/or limit to filter.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Response<List<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool unreadOnly = false, [FromQuery] int? limit = null)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _notificationService.GetAllAsync(userId.Value, unreadOnly, limit));
    }

    /// <summary>Get the count of unread notifications for the current user.</summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(Response<UnreadCountDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _notificationService.GetUnreadCountAsync(userId.Value));
    }

    /// <summary>Mark a single notification as read.</summary>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _notificationService.MarkAsReadAsync(id, userId.Value));
    }

    /// <summary>Mark all notifications as read for the current user.</summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _notificationService.MarkAllReadAsync(userId.Value));
    }

    /// <summary>Delete a single notification.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _notificationService.DeleteAsync(id, userId.Value));
    }
}
