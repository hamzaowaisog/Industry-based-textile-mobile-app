using HamzaTex.Api.Helpers;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Development-only helpers — validate FCM payloads without delivering to real devices.</summary>
[Produces("application/json")]
[Route("api/[controller]")]
public class DebugController : BaseController
{
    private readonly IPushNotificationService _push;

    public DebugController(IPushNotificationService push)
    {
        _push = push;
    }

    /// <summary>
    /// Validate a push notification payload against FCM using dry_run mode.
    /// No message is delivered to any device. Returns the FCM message ID and the full data payload that would be sent.
    /// Supported types: order_created, order_delivered, order_cancelled, purchase_delivered,
    /// payment_received, payment_paid, payment_reversed, invoice_issued, invoice_overdue,
    /// low_stock, expense_approved, sync_complete, sync_partial, sync_failed.
    /// </summary>
    [HttpPost("test-push")]
    [ProducesResponseType(typeof(Response<object>), 200)]
    [ProducesResponseType(typeof(Response<object>), 400)]
    public async Task<IActionResult> TestPush([FromBody] TestPushRequest request)
    {
        var (messageId, payload) = await _push.SendDryRunAsync(
            request.NotificationType,
            request.TemplateVars ?? new Dictionary<string, string>());

        if (messageId is "NOT_CONFIGURED")
            return ToActionResult(Response<object>.ErrorResponse("Firebase is not configured on the server."));

        if (messageId is "UNKNOWN_TYPE")
            return ToActionResult(Response<object>.ErrorResponse(
                $"Unknown notification type '{request.NotificationType}'."));

        return ToActionResult(Response<object>.SuccessResponse(new
        {
            fcmMessageId = messageId,
            notificationType = request.NotificationType,
            resolvedPayload = payload
        }, "Dry-run successful — payload accepted by FCM, no message delivered."));
    }
}

public class TestPushRequest
{
    /// <summary>Notification type key from the catalog (e.g. "order_delivered").</summary>
    public string NotificationType { get; set; } = string.Empty;

    /// <summary>Template variable substitutions (e.g. orderId, clientName, amount).</summary>
    public Dictionary<string, string>? TemplateVars { get; set; }
}
