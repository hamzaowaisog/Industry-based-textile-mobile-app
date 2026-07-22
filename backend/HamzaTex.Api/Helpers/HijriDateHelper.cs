using System.Globalization;

namespace HamzaTex.Api.Helpers;

/// <summary>
/// Converts Gregorian dates to the tabular Islamic (Hijri) calendar and formats Hijri
/// date strings for display. All stored Hijri values use the "yyyy-MM-dd" (Hijri) format.
/// </summary>
public static class HijriDateHelper
{
    private static readonly HijriCalendar Calendar = new();

    public static readonly string[] HijriMonthNames =
    [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];

    /// <summary>
    /// Converts a Gregorian date to its Hijri equivalent, shifting by offsetDays first
    /// to apply the admin-configured moon-sighting correction. Returns "yyyy-MM-dd" in Hijri terms.
    /// </summary>
    public static string ToHijriString(DateOnly gregorianDate, int offsetDays)
    {
        var adjusted = gregorianDate.AddDays(offsetDays);
        var dateTime = adjusted.ToDateTime(TimeOnly.MinValue);

        var year = Calendar.GetYear(dateTime);
        var month = Calendar.GetMonth(dateTime);
        var day = Calendar.GetDayOfMonth(dateTime);

        return $"{year:D4}-{month:D2}-{day:D2}";
    }

    /// <summary>
    /// Formats a stored Hijri date string ("1448-01-06") as "06 Muharram 1448" for display.
    /// Returns null for null/empty input.
    /// </summary>
    public static string? FormatForDisplay(string? hijriDateString)
    {
        if (string.IsNullOrWhiteSpace(hijriDateString))
        {
            return null;
        }

        var parts = hijriDateString.Split('-');
        if (parts.Length != 3
            || !int.TryParse(parts[0], out var year)
            || !int.TryParse(parts[1], out var month)
            || !int.TryParse(parts[2], out var day)
            || month is < 1 or > 12)
        {
            return hijriDateString;
        }

        return $"{day:D2} {HijriMonthNames[month - 1]} {year}";
    }

    /// <summary>
    /// Formats a "yyyy-MM" Hijri year-month key (e.g. from a *_hijri view's grouped column)
    /// as "Safar 1448" for display. Returns the raw input if it doesn't parse.
    /// </summary>
    public static string FormatHijriMonthLabel(string? hijriMonth)
    {
        if (string.IsNullOrWhiteSpace(hijriMonth))
        {
            return string.Empty;
        }

        var parts = hijriMonth.Split('-');
        if (parts.Length != 2
            || !int.TryParse(parts[0], out var year)
            || !int.TryParse(parts[1], out var month)
            || month is < 1 or > 12)
        {
            return hijriMonth;
        }

        return $"{HijriMonthNames[month - 1]} {year}";
    }

    /// <summary>
    /// Filters rows whose "yyyy-MM" Hijri month key (selected via <paramref name="hijriMonthSelector"/>)
    /// matches the given Hijri year and/or month. Returns all rows if both are null.
    /// </summary>
    public static List<T> FilterByPeriod<T>(List<T> rows, Func<T, string?> hijriMonthSelector, int? year, int? month)
    {
        if (!year.HasValue && !month.HasValue)
        {
            return rows;
        }

        return rows.Where(r =>
        {
            var parts = hijriMonthSelector(r)?.Split('-');
            if (parts is not { Length: 2 }
                || !int.TryParse(parts[0], out var rowYear)
                || !int.TryParse(parts[1], out var rowMonth))
            {
                return false;
            }

            return (!year.HasValue || rowYear == year.Value) && (!month.HasValue || rowMonth == month.Value);
        }).ToList();
    }
}

