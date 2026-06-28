using System.Globalization;

namespace HamzaTex.Api.Helpers;

/// <summary>
/// Single source of truth for PDF money rendering across <c>PdfService</c>
/// (both list exports and branded documents).
/// Produces a deterministic "Rs 50,000" regardless of the runtime's ICU currency
/// symbol (which can surface ₨ / PKRs and may not render in the default PDF font).
/// </summary>
public static class PdfFormat
{
    private static readonly CultureInfo Culture = LoadCulture();

    /// <summary>Formats an amount as "Rs {value}" with thousands grouping and the given decimals.</summary>
    public static string Rs(decimal value, int decimals = 0)
    {
        var fmt = "N" + Math.Max(0, decimals);
        return $"Rs {value.ToString(fmt, Culture)}";
    }

    private static CultureInfo LoadCulture()
    {
        try { return new CultureInfo("en-PK"); }
        catch { return CultureInfo.InvariantCulture; }
    }
}
