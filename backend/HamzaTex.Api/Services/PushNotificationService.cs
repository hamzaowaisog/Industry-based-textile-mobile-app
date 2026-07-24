using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using HamzaTex.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Sends FCM push notifications (alert + data) to registered device tokens. Singleton — holds the initialized FirebaseApp instance.</summary>
public interface IPushNotificationService
{
    /// <summary>Send an FCM message with a system notification banner and data payload to a single device token.</summary>
    Task SendAsync(string deviceToken, string title, string body, Dictionary<string, string> data);

    /// <summary>Fan-out to all active device tokens of a user.</summary>
    Task SendToUserAsync(int userId, string title, string body, Dictionary<string, string> data);

    /// <summary>Send a templated notification by catalog type, replacing {var} placeholders in title/body.</summary>
    Task SendTypedAsync(int userId, string notificationType, Dictionary<string, string> templateVars);

    /// <summary>Validate a notification payload against FCM without delivering. Returns the FCM message ID and the full data payload.</summary>
    Task<(string MessageId, Dictionary<string, string> Payload)> SendDryRunAsync(string notificationType, Dictionary<string, string> templateVars);
}

public class PushNotificationService : IPushNotificationService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PushNotificationService> _logger;
    private readonly bool _isConfigured;

    private static readonly Dictionary<string, (string Title, string Body)> _catalog = new()
    {
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
        ["client_added"]       = ("New Client Added",    "{clientName} has been added as a client"),
        ["account_deactivated"] = ("Account Deactivated", "Your account has been deactivated by an administrator."),
        ["hijri_offset_reminder"] = ("New Hijri Month Expected", "A new Hijri month is expected to begin tomorrow. Please confirm the moon sighting and adjust the calendar offset in Settings if needed."),
    };

    public PushNotificationService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<PushNotificationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var json = configuration["Firebase:ServiceAccountJson"];
        var path = configuration["Firebase:ServiceAccountPath"];

        GoogleCredential? credential = null;
        if (!string.IsNullOrWhiteSpace(json))
        {
            credential = GoogleCredential.FromJson(json);
        }
        else if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
        {
            credential = GoogleCredential.FromFile(path);
        }

        if (credential is null)
        {
            _logger.LogWarning("No Firebase service account configured (Firebase:ServiceAccountJson or Firebase:ServiceAccountPath). Push notifications disabled.");
            _isConfigured = false;
            return;
        }

        if (FirebaseApp.DefaultInstance is null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = credential
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
            Notification = new Notification
            {
                Title = title,
                Body = body,
            },
            Data = payload,
            Android = new AndroidConfig
            {
                Priority = Priority.High,
                Notification = new AndroidNotification
                {
                    ChannelId = "hamzatex",
                    DefaultSound = true,
                },
            },
            Apns = new ApnsConfig
            {
                Headers = new Dictionary<string, string> { ["apns-priority"] = "10" },
                Aps = new Aps
                {
                    ContentAvailable = true,
                    Sound = "default",
                },
            },
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

    public async Task<(string MessageId, Dictionary<string, string> Payload)> SendDryRunAsync(
        string notificationType, Dictionary<string, string> templateVars)
    {
        if (!_isConfigured)
            return ("NOT_CONFIGURED", new Dictionary<string, string>());

        if (!_catalog.TryGetValue(notificationType, out var template))
            return ("UNKNOWN_TYPE", new Dictionary<string, string>());

        var title = ReplacePlaceholders(template.Title, templateVars);
        var body  = ReplacePlaceholders(template.Body,  templateVars);

        var payload = new Dictionary<string, string>(templateVars)
        {
            ["type"]      = notificationType,
            ["title"]     = title,
            ["body"]      = body,
            ["screen"]    = BuildScreen(notificationType, templateVars),
            ["timestamp"] = DateTime.UtcNow.ToString("O")
        };

        var message = new Message
        {
            Topic = "dry-run-validation",
            Notification = new Notification
            {
                Title = title,
                Body = body,
            },
            Data = payload,
            Android = new AndroidConfig
            {
                Priority = Priority.High,
                Notification = new AndroidNotification
                {
                    ChannelId = "hamzatex",
                    DefaultSound = true,
                },
            },
            Apns = new ApnsConfig
            {
                Headers = new Dictionary<string, string> { ["apns-priority"] = "10" },
                Aps = new Aps
                {
                    ContentAvailable = true,
                    Sound = "default",
                },
            },
        };

        var messageId = await FirebaseMessaging.DefaultInstance.SendAsync(message, dryRun: true);
        return (messageId, payload);
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
        "expense_approved"
            => vars.TryGetValue("expenseId", out var eid) ? $"/expenses/{eid}" : "/expenses",
        "client_added"
            => vars.TryGetValue("clientId", out var cid) ? $"/clients/{cid}" : "/clients",
        "hijri_offset_reminder"
            => "/settings",
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
