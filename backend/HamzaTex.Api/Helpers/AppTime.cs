namespace HamzaTex.Api.Helpers;

/// <summary>Business-local clock for HamzaTex (default: Pakistan Standard Time).</summary>
public static class AppTime
{
    private static TimeZoneInfo _timeZone = ResolveTimeZone("Asia/Karachi");

    public static TimeZoneInfo TimeZone => _timeZone;

    public static void Configure(string? timeZoneId)
    {
        if (!string.IsNullOrWhiteSpace(timeZoneId))
            _timeZone = ResolveTimeZone(timeZoneId);
    }

    /// <summary>Current wall-clock time in the configured business timezone (for DB storage).</summary>
    public static DateTime Now =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _timeZone);

    /// <summary>Convert a business-local DB timestamp to UTC for API serialization.</summary>
    public static DateTime ToUtc(DateTime localUnspecified) =>
        DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(localUnspecified, DateTimeKind.Unspecified),
                _timeZone),
            DateTimeKind.Utc);

    private static TimeZoneInfo ResolveTimeZone(string id)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (TimeZoneNotFoundException) when (id == "Asia/Karachi")
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        }
    }
}
