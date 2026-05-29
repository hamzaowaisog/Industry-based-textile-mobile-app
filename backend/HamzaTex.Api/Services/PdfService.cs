using System.Globalization;
using HamzaTex.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HamzaTex.Api.Services;

public interface IPdfService
{
    byte[] CreatePdf<T>(string title, string description, List<T> dataList, IReadOnlyList<PdfColumnConfig> columns, PdfOptions? options = null);
}

public class PdfOptions
{
    public string BusinessName    { get; set; } = "Hamza Tex";
    public string BusinessTagline { get; set; } = "Weaving Quality. Delivering Trust.";
    public string BusinessAddress { get; set; } = "G.T. 6/18/19, Old Town, Karachi Bazar, Karachi";
    public string BusinessPhone   { get; set; } = "0313-2039333";
    public string BusinessEmail   { get; set; } = "hamzatex007@gmail.com";
    public string SummaryProperty { get; set; } = "";
    public string SummaryLabel    { get; set; } = "Total";
    /// <summary>When set, summary = sum of (this property × SummaryProperty) per row.</summary>
    public string? SummaryMultiplierProperty { get; set; }
    /// <summary>Culture for currency formatting. Default: en-PK (Pakistani Rupee).</summary>
    public string CurrencyCulture { get; set; } = "en-PK";
    /// <summary>Show row numbers in the first column.</summary>
    public bool ShowRowNumbers { get; set; } = false;
    /// <summary>Override logo path. Defaults to assets/business-card.png.</summary>
    public string? LogoPath { get; set; }
    /// <summary>Additional notes displayed at the bottom of the report.</summary>
    public string? FooterNotes { get; set; }
}

public class PdfService : IPdfService
{
    // ── Brand palette — dark navy + teal, matching business card ────────────
    private const string NavyDark     = "#0f172a";  // Slate-900
    private const string NavyMedium   = "#1e293b";  // Slate-800
    private const string NavyLight    = "#334155";  // Slate-700
    private const string TealAccent   = "#0891b2";  // Cyan-600
    private const string TealLight    = "#a5f3fc";  // Cyan-200  (on dark bg)
    private const string TealPale     = "#e0f2fe";  // Cyan-50   (on light bg)
    private const string TealBorder   = "#7dd3fc";  // Cyan-300

    private const string TextPrimary   = "#0f172a";  // Slate-900
    private const string TextSecondary = "#475569";  // Slate-600
    private const string TextMuted     = "#94a3b8";  // Slate-400

    private const string RowEven    = "#f0f9ff";   // Cyan-50
    private const string RowOdd     = "#ffffff";
    private const string BorderCell = "#e2e8f0";   // Slate-200

    private const string GreenBg  = "#dcfce7";   // Green-100
    private const string GreenFg  = "#15803d";   // Green-700
    private const string GrayBg   = "#f1f5f9";   // Slate-100
    private const string GrayFg   = "#94a3b8";   // Slate-400

    static PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] CreatePdf<T>(
        string title,
        string description,
        List<T> dataList,
        IReadOnlyList<PdfColumnConfig> columns,
        PdfOptions? options = null)
    {
        options ??= new PdfOptions();
        var data       = dataList ?? new List<T>();
        var reportDate = DateTime.Now.ToString("dd MMM yyyy");
        var reportTime = DateTime.Now.ToString("HH:mm");
        var reportRef  = $"HT-{DateTime.Now:yyyyMMdd-HHmm}";

        var logoPath = options.LogoPath
            ?? Path.Combine(AppContext.BaseDirectory, "assets", "business-card.png");
        var hasLogo = File.Exists(logoPath);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(TextPrimary));

                // ── HEADER ────────────────────────────────────────────────
                page.Header().Column(headerCol =>
                {
                    // ── Banner ────────────────────────────────────────────
                    headerCol.Item()
                        .Background(NavyDark)
                        .Padding(16)
                        .Row(row =>
                        {
                            // Logo card
                            if (hasLogo)
                            {
                                row.ConstantItem(108)
                                    .Border(1.5f).BorderColor(TealAccent)
                                    .Padding(3)
                                    .Image(logoPath);
                                row.ConstantItem(16); // spacer
                            }

                            // Company identity
                            row.RelativeItem().Column(col =>
                            {
                                col.Item()
                                    .Text(options.BusinessName)
                                    .Bold().FontSize(24).FontColor(Colors.White);
                                col.Item().PaddingTop(4)
                                    .Text(options.BusinessTagline)
                                    .FontSize(9).FontColor(TealLight).Italic();
                            });

                            // Right block: stamp + date
                            row.ConstantItem(120).AlignRight().Column(col =>
                            {
                                // "OFFICIAL REPORT" outlined stamp
                                col.Item().AlignRight()
                                    .Width(118)
                                    .Border(1.5f).BorderColor(TealAccent)
                                    .PaddingHorizontal(10).PaddingVertical(5)
                                    .AlignCenter()
                                    .Text("OFFICIAL REPORT")
                                    .Bold().FontSize(8).FontColor(TealLight);

                                col.Item().PaddingTop(10).AlignRight()
                                    .Text(reportDate)
                                    .Bold().FontSize(10).FontColor(Colors.White);
                                col.Item().PaddingTop(3).AlignRight()
                                    .Text(reportTime)
                                    .FontSize(8).FontColor(TealLight);
                            });
                        });

                    // ── Contact strip ─────────────────────────────────────
                    var contactParts = BuildContactParts(options);
                    if (contactParts.Count > 0)
                    {
                        headerCol.Item()
                            .Background(NavyMedium)
                            .PaddingHorizontal(16).PaddingVertical(7)
                            .Row(r =>
                            {
                                r.RelativeItem()
                                    .Text(string.Join("   |   ", contactParts))
                                    .FontSize(8).FontColor(TealLight);
                                r.ConstantItem(130).AlignRight()
                                    .Text($"Ref: {reportRef}")
                                    .FontSize(8).FontColor(NavyLight);
                            });
                    }

                    // ── Teal rule ─────────────────────────────────────────
                    headerCol.Item().Height(4).Background(TealAccent);
                    headerCol.Item().Height(8);
                });

                // ── CONTENT ───────────────────────────────────────────────
                page.Content().PaddingVertical(10).Column(column =>
                {
                    // ── Report title + record count chip ─────────────────
                    column.Item().Row(titleRow =>
                    {
                        titleRow.ConstantItem(5).Background(TealAccent);
                        titleRow.ConstantItem(14);
                        titleRow.RelativeItem().Column(col =>
                        {
                            col.Item()
                                .Text(title)
                                .Bold().FontSize(16).FontColor(NavyDark);
                            if (!string.IsNullOrEmpty(description))
                                col.Item().PaddingTop(4)
                                    .Text(description)
                                    .FontSize(9).FontColor(TextSecondary);
                        });

                        // Record count badge
                        titleRow.ConstantItem(5); // spacer
                        titleRow.ConstantItem(96).AlignRight().AlignMiddle()
                            .Border(1).BorderColor(TealBorder)
                            .Background(TealPale)
                            .PaddingVertical(5).PaddingHorizontal(10)
                            .AlignCenter()
                            .Text($"{data.Count} Records")
                            .Bold().FontSize(8).FontColor(TealAccent);
                    });

                    column.Item().PaddingTop(14);

                    // ── Stats meta bar ────────────────────────────────────
                    column.Item()
                        .Background("#f8fafc")
                        .Border(1).BorderColor(BorderCell)
                        .PaddingHorizontal(14).PaddingVertical(7)
                        .Row(r =>
                        {
                            r.RelativeItem()
                                .Text($"Columns: {columns.Count}   |   Total Records: {data.Count}")
                                .FontSize(8).FontColor(TextSecondary);
                            r.ConstantItem(170).AlignRight()
                                .Text($"Generated: {reportDate} at {reportTime}")
                                .FontSize(8).FontColor(TextMuted);
                        });

                    column.Item().PaddingTop(10);

                    // ── Data table ────────────────────────────────────────
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            if (options.ShowRowNumbers)
                                cols.ConstantColumn(30);
                            foreach (var c in columns)
                                cols.RelativeColumn(c.Format == PdfColumnFormat.Currency ? 1.1f : 1f);
                        });

                        // Header row
                        table.Header(header =>
                        {
                            if (options.ShowRowNumbers)
                                header.Cell()
                                    .Background(NavyDark)
                                    .BorderBottom(2).BorderColor(TealAccent)
                                    .Padding(11).AlignCenter()
                                    .Text("#").Bold().FontSize(8).FontColor(Colors.White);

                            foreach (var col in columns)
                                header.Cell()
                                    .Background(NavyDark)
                                    .BorderBottom(2).BorderColor(TealAccent)
                                    .PaddingHorizontal(10).PaddingVertical(11)
                                    .Text(col.DisplayName.ToUpper())
                                    .Bold().FontSize(8).FontColor(Colors.White);
                        });

                        // Data rows
                        if (data.Count == 0)
                        {
                            // Empty state — single spanning row
                            int totalCols = (options.ShowRowNumbers ? 1 : 0) + columns.Count;
                            for (int c = 0; c < totalCols; c++)
                            {
                                var cell = table.Cell()
                                    .Background("#f8fafc")
                                    .BorderBottom(1).BorderColor(BorderCell)
                                    .Padding(20);

                                if (c == 0)
                                    cell.AlignCenter()
                                        .Text("No records found.")
                                        .FontSize(10).FontColor(TextMuted).Italic();
                                else
                                    cell.Text(""); // blank cells to complete the row
                            }
                        }
                        else
                        {
                            var rowIndex = 0;
                            foreach (var item in data)
                            {
                                if (item is null) continue;
                                var rowBg = rowIndex % 2 == 0 ? RowEven : RowOdd;

                                if (options.ShowRowNumbers)
                                    table.Cell()
                                        .Background(rowBg)
                                        .BorderBottom(1).BorderColor(BorderCell)
                                        .Padding(10).AlignCenter()
                                        .Text((rowIndex + 1).ToString())
                                        .FontSize(9).FontColor(TextSecondary);

                                foreach (var col in columns)
                                {
                                    var value = GetPropertyValue(item, col.PropertyName);

                                    // Boolean — colored badge cell
                                    if (col.Format == PdfColumnFormat.Boolean && value is bool boolVal)
                                    {
                                        table.Cell()
                                            .Background(boolVal ? GreenBg : GrayBg)
                                            .BorderBottom(1).BorderColor(BorderCell)
                                            .Padding(10).AlignCenter()
                                            .Text(boolVal ? "✓  Yes" : "✗  No")
                                            .Bold().FontSize(9)
                                            .FontColor(boolVal ? GreenFg : GrayFg);
                                        continue;
                                    }

                                    var displayValue = FormatValue(value, col.Format, options.CurrencyCulture);
                                    var cell = table.Cell()
                                        .Background(rowBg)
                                        .BorderBottom(1).BorderColor(BorderCell)
                                        .Padding(10);

                                    if (col.Format == PdfColumnFormat.Currency
                                        || value is int or long or decimal or double or float)
                                        cell.AlignRight()
                                            .Text(displayValue).FontSize(9).FontColor(TextPrimary);
                                    else
                                        cell.AlignLeft()
                                            .Text(displayValue).FontSize(9).FontColor(TextPrimary);
                                }
                                rowIndex++;
                            }
                        }
                    });

                    // ── Summary bar ───────────────────────────────────────
                    if (!string.IsNullOrEmpty(options.SummaryProperty) && data.Count > 0)
                    {
                        var total = string.IsNullOrEmpty(options.SummaryMultiplierProperty)
                            ? CalculateSum(data, options.SummaryProperty)
                            : CalculateProductSum(data, options.SummaryMultiplierProperty, options.SummaryProperty);
                        var culture = GetCulture(options.CurrencyCulture);

                        column.Item().PaddingTop(0)
                            .Background(NavyDark)
                            .PaddingHorizontal(14).PaddingVertical(12)
                            .Row(row =>
                            {
                                row.RelativeItem().AlignMiddle()
                                    .Text($"{data.Count} record{(data.Count == 1 ? "" : "s")}")
                                    .FontSize(8).FontColor(NavyLight);

                                row.ConstantItem(180).AlignRight().AlignMiddle().Column(col =>
                                {
                                    col.Item().AlignRight()
                                        .Text($"{options.SummaryLabel}")
                                        .Bold().FontSize(9).FontColor(TealLight);
                                });
                                row.ConstantItem(10); // spacer
                                row.ConstantItem(120).AlignRight().AlignMiddle()
                                    .Text(total.ToString("C", culture))
                                    .Bold().FontSize(13).FontColor(Colors.White);
                            });
                    }
                    else if (data.Count > 0)
                    {
                        // No financial summary — still show record count bar
                        column.Item().PaddingTop(0)
                            .Background(NavyMedium)
                            .PaddingHorizontal(14).PaddingVertical(9)
                            .Text($"{data.Count} record{(data.Count == 1 ? "" : "s")} — end of report")
                            .FontSize(8).FontColor(NavyLight).Italic();
                    }

                    // ── Notes box ─────────────────────────────────────────
                    if (!string.IsNullOrEmpty(options.FooterNotes))
                    {
                        column.Item().PaddingTop(20)
                            .Background("#f8fafc")
                            .Border(1).BorderColor(BorderCell)
                            .Padding(14)
                            .Column(notesCol =>
                            {
                                notesCol.Item()
                                    .Text("Notes & Remarks")
                                    .Bold().FontSize(9).FontColor(TextSecondary);
                                notesCol.Item().Height(1).Background(BorderCell).PaddingTop(6);
                                notesCol.Item().PaddingTop(8)
                                    .Text(options.FooterNotes)
                                    .FontSize(8).FontColor(TextSecondary).LineHeight(1.5f);
                            });
                    }
                });

                // ── FOOTER ────────────────────────────────────────────────
                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().Height(3).Background(TealAccent);
                    footerCol.Item()
                        .PaddingTop(8)
                        .Row(row =>
                        {
                            row.RelativeItem().AlignMiddle()
                                .Text($"{options.BusinessName}  —  Confidential")
                                .FontSize(8).FontColor(TextMuted).Italic();

                            row.ConstantItem(140).AlignCenter().AlignMiddle()
                                .Text($"Ref: {reportRef}")
                                .FontSize(7).FontColor(TextMuted);

                            row.ConstantItem(80).AlignRight().AlignMiddle()
                                .Text(text =>
                                {
                                    text.Span("Page ").FontSize(8).FontColor(TextMuted);
                                    text.CurrentPageNumber().FontSize(8).FontColor(TextSecondary).Bold();
                                    text.Span(" / ").FontSize(8).FontColor(TextMuted);
                                    text.TotalPages().FontSize(8).FontColor(TextSecondary);
                                });
                        });
                });
            });
        });

        return document.GeneratePdf();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static List<string> BuildContactParts(PdfOptions options)
    {
        var parts = new List<string>();
        if (!string.IsNullOrEmpty(options.BusinessAddress)) parts.Add(options.BusinessAddress);
        if (!string.IsNullOrEmpty(options.BusinessPhone))   parts.Add(options.BusinessPhone);
        if (!string.IsNullOrEmpty(options.BusinessEmail))   parts.Add(options.BusinessEmail);
        return parts;
    }

    private static object? GetPropertyValue<T>(T item, string propertyName)
    {
        if (string.IsNullOrEmpty(propertyName)) return null;
        return typeof(T).GetProperty(propertyName)?.GetValue(item, null);
    }

    private static string FormatValue(object? value, PdfColumnFormat format, string currencyCulture = "en-PK")
    {
        if (value is null) return "—";
        return format switch
        {
            PdfColumnFormat.Currency   => FormatCurrency(value, currencyCulture),
            PdfColumnFormat.Date       => FormatDate(value),
            PdfColumnFormat.Boolean    => value is bool b ? (b ? "Yes" : "No") : value.ToString() ?? "—",
            PdfColumnFormat.Percentage => FormatPercentage(value),
            _                          => value.ToString() ?? "—"
        };
    }

    private static string FormatCurrency(object value, string currencyCulture = "en-PK")
    {
        var culture = GetCulture(currencyCulture);
        if (value is decimal d)  return d.ToString("C", culture);
        if (value is double dbl) return dbl.ToString("C", culture);
        if (value is float f)    return f.ToString("C", culture);
        if (value is int i)      return i.ToString("C", culture);
        if (value is long l)     return l.ToString("C", culture);
        return value.ToString() ?? "—";
    }

    private static string FormatPercentage(object value)
    {
        if (value is decimal d)  return $"{d:0.##}%";
        if (value is double dbl) return $"{dbl:0.##}%";
        if (value is float f)    return $"{f:0.##}%";
        return value.ToString() ?? "—";
    }

    private static string FormatDate(object value)
    {
        if (value is DateTime dt) return dt.ToString("dd MMM yyyy");
        if (value is DateOnly d)  return d.ToString("dd MMM yyyy");
        return value.ToString() ?? "—";
    }

    private static CultureInfo GetCulture(string code)
    {
        try   { return new CultureInfo(code); }
        catch { return new CultureInfo("en-PK"); }
    }

    private static decimal CalculateSum<T>(List<T> data, string propertyName)
    {
        decimal total = 0;
        var prop = typeof(T).GetProperty(propertyName);
        if (prop is null) return 0;
        foreach (var item in data)
        {
            if (item is not null)
                total += GetDecimalValue(prop.GetValue(item, null));
        }
        return total;
    }

    private static decimal CalculateProductSum<T>(List<T> data, string multiplierProp, string valueProp)
    {
        decimal total = 0;
        var mProp = typeof(T).GetProperty(multiplierProp);
        var vProp = typeof(T).GetProperty(valueProp);
        if (mProp is null || vProp is null) return 0;
        foreach (var item in data)
        {
            if (item is not null)
                total += GetDecimalValue(mProp.GetValue(item, null))
                       * GetDecimalValue(vProp.GetValue(item, null));
        }
        return total;
    }

    private static decimal GetDecimalValue(object? val) => val switch
    {
        decimal d  => d,
        double dbl => (decimal)dbl,
        float f    => (decimal)f,
        int i      => i,
        long l     => l,
        _          => 0
    };
}
