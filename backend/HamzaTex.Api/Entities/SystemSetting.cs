namespace HamzaTex.Api.Entities;

/// <summary>
/// Single-row table holding global, admin-adjustable system configuration.
/// Currently used for the Hijri calendar moon-sighting correction offset.
/// </summary>
public class SystemSetting
{
    public int Id { get; set; }

    /// <summary>Days to shift the tabular Hijri calendar to match locally announced moon sighting. Range -2..+2.</summary>
    public int HijriOffsetDays { get; set; }

    /// <summary>Dedup guard for the daily Hijri new-month reminder job — null until the first reminder fires.</summary>
    public DateOnly? LastHijriReminderSentDate { get; set; }
}
