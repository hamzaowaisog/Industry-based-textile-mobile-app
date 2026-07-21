using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Daily background job that reminds Admins to confirm/adjust the Hijri calendar offset
/// the day before a new Hijri month is expected to start (per the tabular calendar).
/// </summary>
public class HijriOffsetReminderJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<HijriOffsetReminderJob> _logger;

    public HijriOffsetReminderJob(IServiceScopeFactory scopeFactory, ILogger<HijriOffsetReminderJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndNotifyAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HijriOffsetReminderJob run failed");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task CheckAndNotifyAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var settings = await context.SystemSettings.FirstOrDefaultAsync(ct);
        if (settings is null)
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (settings.LastHijriReminderSentDate == today)
        {
            return;
        }

        var tomorrow = today.AddDays(1);
        var tomorrowHijri = HijriDateHelper.ToHijriString(tomorrow, settings.HijriOffsetDays);
        var tomorrowHijriDay = tomorrowHijri.Split('-')[2];

        if (tomorrowHijriDay != "01")
        {
            return;
        }

        await notificationService.CreateForAdminsAsync(
            "hijri_offset_reminder",
            "New Hijri Month Expected",
            "A new Hijri month is expected to begin tomorrow. Please confirm the moon sighting and adjust the calendar offset in Settings if needed.");

        settings.LastHijriReminderSentDate = today;
        await context.SaveChangesAsync(ct);
    }
}
