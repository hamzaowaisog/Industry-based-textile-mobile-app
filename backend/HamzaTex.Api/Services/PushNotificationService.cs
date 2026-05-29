using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using HamzaTex.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Sends FCM data-only push notifications to registered device tokens. Singleton — holds the initialized FirebaseApp instance.</summary>
public interface IPushNotificationService
{
    /// <summary>Send a data-only FCM message to a single device token.</summary>
    Task SendAsync(string deviceToken, string title, string body, Dictionary<string, string> data);

    /// <summary>Fan-out to all active device tokens of a user.</summary>
    Task SendToUserAsync(int userId, string title, string body, Dictionary<string, string> data);

    /// <summary>Send a templated notification by catalog type, replacing {var} placeholders in title/body.</summary>
    Task SendTypedAsync(int userId, string notificationType, Dictionary<string, string> templateVars);
}

public class PushNotificationService : IPushNotificationService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PushNotificationService> _logger;
    private readonly bool _isConfigured;

    private static readonly Dictionary<string, (string Title, string Body)> _catalog = new()
    {
        ["sync_complete"]      = ("Sync Complete",       "All {count} changes synced successfully"),
        ["sync_partial"]       = ("Sync Issues",         "{rejected} of {total} items failed to sync"),
        ["sync_failed"]        = ("Sync Failed",         "Sync failed — tap to retry"),
        ["order_created"]      = ("New Order",           "Order #{orderId} created for {clientName}"),
        ["order_delivered"]    = ("Order Delivered",     "Order #{orderId} marked as delivered"),
        ["order_cancelled"]    = ("Order Cancelled",     "Order #{orderId} has been cancelled"),
        ["purchase_delivered"] = ("Purchase Delivered",  "Purchase #{purchaseId} from {supplierName} delivered"),
        ["payment_received"]   = ("Payment Received",    "{clientName} paid PKR {amount}"),
        ["payment_paid"]       = ("Payment Made",        "PKR {amount} paid to {clientName}"),
        ["payment_reversed"]   = ("Payment Reversed",    "Payment of PKR {amount} has been reversed"),
        ["invoice_issued"]     = ("Invoice Issued",      "Invoice {invoiceNumber} issued for PKR {amount}"),
        ["invoice_overdue"]    = ("Invoice Overdue",     "Invoice {invoiceNumber} is past due date"),
        ["low_stock"]          = ("Low Stock Alert",     "{productName} is below reorder level ({qty} remaining)"),
        ["expense_approved"]   = ("Expense Recorded",    "PKR {amount} expense recorded ({category})"),
    };

    public PushNotificationService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<PushNotificationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var path = configuration["Firebase:ServiceAccountPath"];
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
            _logger.LogWarning("Firebase service account not found at '{Path}'. Push notifications disabled.", path);
            _isConfigured = false;
            return;
        }

        if (FirebaseApp.DefaultInstance is null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile(path)
            });
        }

        _isConfigured = true;
    }

    public async Task SendAsync(string deviceToken, string title, string body, Dictionary<string, string> data)
    {
        if (!_isConfigured) return;

        var payload = new Dictionary<string, string>(data)
        {
            ["title"] = title,
            ["body"] = body,
            ["timestamp"] = DateTime.UtcNow.ToString("O")
        };

        var message = new Message
        {
            Token = deviceToken,
            Data = payload,
            Android = new AndroidConfig { Priority = Priority.High },
            Apns = new ApnsConfig
            {
                Headers = new Dictionary<string, string> { ["apns-priority"] = "10" },
                Aps = new Aps { ContentAvailable = true }
            }
        };

        try
        {
            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
        catch (FirebaseMessagingException ex) when (
            ex.MessagingErrorCode is MessagingErrorCode.Unregistered or MessagingErrorCode.InvalidArgument)
        {
            _logger.LogWarning("FCM token invalid, deactivating: {Token}", deviceToken);
            await DeactivateTokenAsync(deviceToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send FCM message to token {Token}", deviceToken);
        }
    }

    public async Task SendToUserAsync(int userId, string title, string body, Dictionary<string, string> data)
    {
        if (!_isConfigured) return;

        List<string> tokens;
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            tokens = await db.DeviceTokens
                .Where(t => t.UserId == userId && t.IsActive)
                .Select(t => t.PushToken)
                .ToListAsync();
        }

        foreach (var token in tokens)
            await SendAsync(token, title, body, data);
    }

    public async Task SendTypedAsync(int userId, string notificationType, Dictionary<string, string> templateVars)
    {
        if (!_catalog.TryGetValue(notificationType, out var template))
        {
            _logger.LogWarning("Unknown notification type: {Type}", notificationType);
            return;
        }

        var title = ReplacePlaceholders(template.Title, templateVars);
        var body  = ReplacePlaceholders(template.Body,  templateVars);

        var data = new Dictionary<string, string>(templateVars)
        {
            ["type"]   = notificationType,
            ["screen"] = BuildScreen(notificationType, templateVars)
        };

        await SendToUserAsync(userId, title, body, data);
    }

    private static string ReplacePlaceholders(string template, Dictionary<string, string> vars)
    {
        foreach (var (key, value) in vars)
            template = template.Replace("{" + key + "}", value);
        return template;
    }

    private static string BuildScreen(string type, Dictionary<string, string> vars) => type switch
    {
        "order_created" or "order_delivered" or "order_cancelled"
            => vars.TryGetValue("orderId", out var oid) ? $"/orders/{oid}" : "/orders",
        "purchase_delivered"
            => vars.TryGetValue("purchaseId", out var pid) ? $"/purchases/{pid}" : "/purchases",
        "payment_received" or "payment_paid" or "payment_reversed"
            => vars.TryGetValue("paymentId", out var pmid) ? $"/payments/{pmid}" : "/payments",
        "invoice_issued" or "invoice_overdue"
            => vars.TryGetValue("invoiceId", out var iid) ? $"/invoices/{iid}" : "/invoices",
        "low_stock"
            => vars.TryGetValue("productId", out var prid) ? $"/products/{prid}" : "/products",
        "sync_complete" or "sync_partial" or "sync_failed" => "/sync-status",
        "expense_approved"
            => vars.TryGetValue("expenseId", out var eid) ? $"/expenses/{eid}" : "/expenses",
        _ => "/"
    };

    private async Task DeactivateTokenAsync(string pushToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var token = await db.DeviceTokens.FirstOrDefaultAsync(t => t.PushToken == pushToken);
        if (token is not null)
        {
            token.IsActive = false;
            await db.SaveChangesAsync();
        }
    }
}
