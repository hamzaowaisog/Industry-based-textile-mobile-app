using System.Globalization;
using System.Reflection;
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
    public string BusinessName { get; set; } = "Hamza Tex";
    public string BusinessTagline { get; set; } = "Your trusted partner in high-quality textiles";
    public string BusinessAddress { get; set; } = "Karachi, Pakistan";
    public string BusinessPhone { get; set; } = "0332-2039333";
    public string BusinessEmail { get; set; } = "hamzatex007@gmail.com";
    public string SummaryProperty { get; set; } = ""; // e.g. "DefaultPrice" - property to sum for footer
    public string SummaryLabel { get; set; } = "Total";
    /// <summary>When set, summary = sum of (this property × SummaryProperty) per row. e.g. "Quantity" with SummaryProperty "DefaultPrice" = total value.</summary>
    public string? SummaryMultiplierProperty { get; set; }
    /// <summary>Culture for currency formatting. Default: en-PK (Pakistani Rupee).</summary>
    public string CurrencyCulture { get; set; } = "en-PK";
    /// <summary>Show row numbers in table</summary>
    public bool ShowRowNumbers { get; set; } = false;
    /// <summary>Custom logo path (optional)</summary>
    public string? LogoPath { get; set; }
    /// <summary>Additional notes or terms to display at bottom</summary>
    public string? FooterNotes { get; set; }
}

public class PdfService : IPdfService
{
    // Refined corporate color palette - minimal, professional
    private static readonly string TextPrimary = "#1e293b";       // Slate 800
    private static readonly string TextSecondary = "#64748b";     // Slate 500
    private static readonly string TextMuted = "#94a3b8";        // Slate 400
    private static readonly string TableHeaderBg = "#475569";    // Slate 600
    private static readonly string RowEven = "#f8fafc";          // Slate 50
    private static readonly string RowOdd = "#ffffff";
    private static readonly string BorderColor = "#e2e8f0";       // Slate 200
    private static readonly string DividerColor = "#cbd5e1";       // Slate 300

    static PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] CreatePdf<T>(string title, string description, List<T> dataList, IReadOnlyList<PdfColumnConfig> columns, PdfOptions? options = null)
    {
        options ??= new PdfOptions();
        var data = dataList ?? new List<T>();
        var reportDate = DateTime.Now.ToString("dd MMM yyyy");
        var reportTime = DateTime.Now.ToString("HH:mm");

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(TextPrimary));

                // Header - Clean, minimal
                page.Header().Column(headerCol =>
                {
                    headerCol.Item().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(options.BusinessName)
                                .Bold().FontSize(18).FontColor(TextPrimary);
                            col.Item().PaddingTop(2).Text(options.BusinessTagline)
                                .FontSize(9).FontColor(TextSecondary);
                        });
                        row.ConstantItem(120).AlignRight().Column(col =>
                        {
                            col.Item().Text(reportDate).FontSize(9).FontColor(TextSecondary);
                            col.Item().Text(reportTime).FontSize(8).FontColor(TextMuted);
                        });
                    });
                    // Contact line - simple text, no icons
                    if (!string.IsNullOrEmpty(options.BusinessAddress) || !string.IsNullOrEmpty(options.BusinessPhone) || !string.IsNullOrEmpty(options.BusinessEmail))
                    {
                        var contactParts = new List<string>();
                        if (!string.IsNullOrEmpty(options.BusinessAddress)) contactParts.Add(options.BusinessAddress);
                        if (!string.IsNullOrEmpty(options.BusinessPhone)) contactParts.Add(options.BusinessPhone);
                        if (!string.IsNullOrEmpty(options.BusinessEmail)) contactParts.Add(options.BusinessEmail);
                        headerCol.Item().PaddingTop(8).Text(string.Join("  |  ", contactParts))
                            .FontSize(8).FontColor(TextMuted);
                    }
                    headerCol.Item().PaddingTop(12).LineHorizontal(1).LineColor(DividerColor);
                });

                // Content
                page.Content().PaddingVertical(18).Column(column =>
                {
                    // Report title - simple
                    column.Item().Column(col =>
                    {
                        col.Item().Text(title).Bold().FontSize(16).FontColor(TextPrimary);
                        if (!string.IsNullOrEmpty(description))
                            col.Item().PaddingTop(4).Text(description).FontSize(9).FontColor(TextSecondary);
                    });
                    column.Item().PaddingTop(16);

                    // Table
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            if (options.ShowRowNumbers)
                                cols.ConstantColumn(36);
                            foreach (var c in columns)
                                cols.RelativeColumn(c.Format == PdfColumnFormat.Currency ? 1.1f : 1f);
                        });

                        table.Header(header =>
                        {
                            if (options.ShowRowNumbers)
                                header.Cell().Background(TableHeaderBg).Padding(10).AlignCenter()
                                    .Text("#").Bold().FontSize(9).FontColor(Colors.White);
                            foreach (var col in columns)
                                header.Cell().Background(TableHeaderBg).Padding(10)
                                    .Text(col.DisplayName).Bold().FontSize(9).FontColor(Colors.White);
                        });

                        var rowIndex = 0;
                        foreach (var item in data)
                        {
                            if (item is null) continue;
                            var bgColor = rowIndex % 2 == 0 ? RowEven : RowOdd;

                            if (options.ShowRowNumbers)
                                table.Cell().Background(bgColor).Border(1).BorderColor(BorderColor).Padding(10).AlignCenter()
                                    .Text((rowIndex + 1).ToString()).FontSize(9).FontColor(TextSecondary);

                            foreach (var col in columns)
                            {
                                var value = GetPropertyValue(item, col.PropertyName);
                                var displayValue = FormatValue(value, col.Format, options.CurrencyCulture);
                                var cell = table.Cell().Background(bgColor).Border(1).BorderColor(BorderColor).Padding(10);

                                if (col.Format == PdfColumnFormat.Currency || value is int or long or decimal or double or float)
                                    cell.AlignRight().Text(displayValue).FontSize(9).FontColor(TextPrimary);
                                else
                                    cell.AlignLeft().Text(displayValue).FontSize(9).FontColor(TextPrimary);
                            }
                            rowIndex++;
                        }
                    });

                    // Summary - clean, minimal
                    if (!string.IsNullOrEmpty(options.SummaryProperty) && data.Count > 0)
                    {
                        var total = string.IsNullOrEmpty(options.SummaryMultiplierProperty)
                            ? CalculateSum(data, options.SummaryProperty)
                            : CalculateProductSum(data, options.SummaryMultiplierProperty, options.SummaryProperty);
                        var culture = GetCulture(options.CurrencyCulture);

                        column.Item().PaddingTop(20).BorderTop(1).BorderColor(DividerColor).PaddingTop(14)
                            .Row(row =>
                            {
                                row.RelativeItem();
                                row.ConstantItem(140).AlignRight().Text($"{options.SummaryLabel}:")
                                    .Bold().FontSize(10).FontColor(TextPrimary);
                                row.ConstantItem(100).AlignRight().Text(total.ToString("C", culture))
                                    .Bold().FontSize(11).FontColor(TextPrimary);
                            });
                    }

                    // Footer notes
                    if (!string.IsNullOrEmpty(options.FooterNotes))
                    {
                        column.Item().PaddingTop(18).BorderTop(1).BorderColor(BorderColor).PaddingTop(12)
                            .Column(notesCol =>
                            {
                                notesCol.Item().Text("Notes").Bold().FontSize(9).FontColor(TextSecondary);
                                notesCol.Item().PaddingTop(6).Text(options.FooterNotes)
                                    .FontSize(8).FontColor(TextSecondary).LineHeight(1.4f);
                            });
                    }
                });

                // Footer - minimal
                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().LineHorizontal(1).LineColor(BorderColor);
                    footerCol.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text($"{options.BusinessName}").FontSize(8).FontColor(TextMuted);
                        row.ConstantItem(70).AlignCenter().Text(text =>
                        {
                            text.CurrentPageNumber().FontSize(8).FontColor(TextSecondary);
                            text.Span(" / ").FontSize(8).FontColor(TextMuted);
                            text.TotalPages().FontSize(8).FontColor(TextSecondary);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    private static object? GetPropertyValue<T>(T item, string propertyName)
    {
        if (string.IsNullOrEmpty(propertyName)) return null;
        var prop = typeof(T).GetProperty(propertyName);
        return prop?.GetValue(item, null);
    }

    private static string FormatValue(object? value, PdfColumnFormat format, string currencyCulture = "en-PK")
    {
        if (value is null) return "—";

        return format switch
        {
            PdfColumnFormat.Currency => FormatCurrency(value, currencyCulture),
            PdfColumnFormat.Date => FormatDate(value),
            PdfColumnFormat.Boolean => value is bool b ? (b ? "Yes" : "No") : value.ToString() ?? "—",
            PdfColumnFormat.Percentage => FormatPercentage(value),
            _ => value.ToString() ?? "—"
        };
    }

    private static string FormatCurrency(object value, string currencyCulture = "en-PK")
    {
        var culture = GetCulture(currencyCulture);
        if (value is decimal d) return d.ToString("C", culture);
        if (value is decimal?)
        {
            var dn = (decimal?)value;
            if (dn.HasValue) return dn.Value.ToString("C", culture);
        }
        if (value is double dbl) return dbl.ToString("C", culture);
        if (value is float f) return f.ToString("C", culture);
        if (value is int i) return i.ToString("C", culture);
        if (value is long l) return l.ToString("C", culture);
        return value.ToString() ?? "—";
    }
    
    private static string FormatPercentage(object value)
    {
        if (value is decimal d) return $"{d:0.##}%";
        if (value is double dbl) return $"{dbl:0.##}%";
        if (value is float f) return $"{f:0.##}%";
        return value.ToString() ?? "—";
    }

    private static CultureInfo GetCulture(string code)
    {
        try { return new CultureInfo(code); }
        catch { return new CultureInfo("en-PK"); }
    }

    private static decimal CalculateProductSum<T>(List<T> data, string multiplierProp, string valueProp)
    {
        decimal total = 0;
        var multProp = typeof(T).GetProperty(multiplierProp);
        var valProp = typeof(T).GetProperty(valueProp);
        if (multProp is null || valProp is null) return 0;

        foreach (var item in data)
        {
            if (item is null) continue;
            var mult = GetDecimalValue(multProp.GetValue(item, null));
            var val = GetDecimalValue(valProp.GetValue(item, null));
            total += mult * val;
        }
        return total;
    }

    private static decimal GetDecimalValue(object? val)
    {
        if (val is decimal d) return d;
        if (val is double dbl) return (decimal)dbl;
        if (val is float f) return (decimal)f;
        if (val is int i) return i;
        if (val is long l) return l;
        return 0;
    }

    private static string FormatDate(object value)
    {
        if (value is DateTime dt) return dt.ToString("dd MMM yyyy");
        if (value is DateOnly d) return d.ToString("dd MMM yyyy");
        return value.ToString() ?? "—";
    }

    private static decimal CalculateSum<T>(List<T> data, string propertyName)
    {
        decimal total = 0;
        var prop = typeof(T).GetProperty(propertyName);
        if (prop is null) return 0;

        foreach (var item in data)
        {
            if (item is null) continue;
            var val = prop.GetValue(item, null);
            if (val is decimal d) total += d;
            else if (val is double dbl) total += (decimal)dbl;
            else if (val is float f) total += (decimal)f;
            else if (val is int i) total += i;
            else if (val is long l) total += l;
        }
        return total;
    }
}