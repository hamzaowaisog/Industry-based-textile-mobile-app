using System.Globalization;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HamzaTex.Api.Services;

/// <summary>Single PDF renderer. <see cref="CreatePdf{T}"/> builds list/table exports; <see cref="CreateDocument"/> builds multi-section branded documents. Both share the same chrome (header/footer/stat cards) and palette.</summary>
public interface IPdfService
{
    byte[] CreatePdf<T>(string title, string description, List<T> dataList, IReadOnlyList<PdfColumnConfig> columns, PdfOptions? options = null);

    /// <summary>Build a multi-section branded document (invoice / statement / dossier / report) using the same chrome as <see cref="CreatePdf{T}"/>.</summary>
    byte[] CreateDocument(HamzaTexDocumentModel model, PdfOptions? options = null);
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
    /// <summary>Decimal places for currency. PKR reports default to 0 (clean rupees, e.g. "Rs 50,000").</summary>
    public int CurrencyDecimalPlaces { get; set; } = 0;
    /// <summary>Show row numbers in the first column.</summary>
    public bool ShowRowNumbers { get; set; } = true;
    /// <summary>Override logo path. Defaults to assets/business-card.png.</summary>
    public string? LogoPath { get; set; }
    /// <summary>Additional notes displayed at the bottom of the report.</summary>
    public string? FooterNotes { get; set; }
    /// <summary>Optional summary stat cards rendered above the table.</summary>
    public List<Stat> Stats { get; set; } = new();
}

public class PdfService : IPdfService
{
    // ── Brand palette — the single source of truth for every PDF ────────────
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
    private const string NegativeFg = "#dc2626"; // Red-600 — debits / overdrawn balances

    static PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    // ════════════════════════════════════════════════════════════════════════
    //  LIST EXPORT  —  CreatePdf<T>
    // ════════════════════════════════════════════════════════════════════════
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
                page.Margin(0);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(TextPrimary));

                // ── HEADER (shared chrome) ────────────────────────────────
                page.Header().Element(c => RenderHeader(c, options, logoPath, hasLogo,
                    stampLabel: "OFFICIAL REPORT", refText: reportRef, dateLine: $"{reportDate} at {reportTime}"));

                // ── CONTENT ───────────────────────────────────────────────
                page.Content().PaddingHorizontal(1f, Unit.Centimetre).PaddingVertical(10).Column(column =>
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
                                .Bold().FontSize(18).FontColor(NavyDark);
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

                    column.Item().PaddingTop(12);

                    // ── Meta bar (generated timestamp + currency note when relevant) ──
                    var hasCurrency = false;
                    for (int i = 0; i < columns.Count; i++)
                    {
                        if (columns[i].Format == PdfColumnFormat.Currency) { hasCurrency = true; break; }
                    }
                    column.Item()
                        .Background("#f8fafc")
                        .Border(1).BorderColor(BorderCell)
                        .PaddingHorizontal(14).PaddingVertical(7)
                        .Row(r =>
                        {
                            r.RelativeItem()
                                .Text(hasCurrency ? "All amounts in PKR (Rs)" : " ")
                                .FontSize(8).FontColor(TextSecondary);
                            r.ConstantItem(170).AlignRight()
                                .Text($"Generated: {reportDate} at {reportTime}")
                                .FontSize(8).FontColor(TextMuted);
                        });

                    // ── Stat cards ─────────────────────────────────────────
                    if (options.Stats.Count > 0)
                    {
                        column.Item().PaddingTop(10).Row(row =>
                        {
                            foreach (var s in options.Stats)
                                row.RelativeItem().PaddingRight(6).Element(c => RenderStatCard(c, s));
                        });
                    }

                    column.Item().PaddingTop(10);

                    // ── Data table ────────────────────────────────────────
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            if (options.ShowRowNumbers)
                                cols.ConstantColumn(8, Unit.Millimetre);
                            foreach (var c in columns)
                            {
                                if (c.FixedWidthMm.HasValue)
                                    cols.ConstantColumn(c.FixedWidthMm.Value, Unit.Millimetre);
                                else
                                    cols.RelativeColumn(c.Weight > 0 ? c.Weight : 1f);
                            }
                        });

                        // Header row
                        table.Header(header =>
                        {
                            if (options.ShowRowNumbers)
                                header.Cell()
                                    .Background(NavyDark)
                                    .BorderBottom(2).BorderColor(TealAccent)
                                    .PaddingHorizontal(5).PaddingVertical(9).AlignCenter()
                                    .Text("#").Bold().FontSize(8).FontColor(Colors.White);

                            foreach (var col in columns)
                                header.Cell()
                                    .Background(NavyDark)
                                    .BorderBottom(2).BorderColor(TealAccent)
                                    .PaddingHorizontal(10).PaddingVertical(11)
                                    .Text(col.DisplayName.ToUpper())
                                    .Bold().FontSize(9).FontColor(Colors.White);
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
                                        .PaddingHorizontal(5).PaddingVertical(7).AlignCenter()
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
                                            .PaddingHorizontal(8).PaddingVertical(7).AlignCenter()
                                            .Text(boolVal ? "✓  Yes" : "✗  No")
                                            .Bold().FontSize(9)
                                            .FontColor(boolVal ? GreenFg : GrayFg);
                                        continue;
                                    }

                                    var displayValue = FormatValue(value, col.Format, options.CurrencyCulture, options.CurrencyDecimalPlaces);
                                    var isNumeric = col.Format == PdfColumnFormat.Currency
                                        || value is int or long or decimal or double or float;
                                    var valueColor = isNumeric && IsNegative(value) ? NegativeFg : TextPrimary;
                                    var cell = table.Cell()
                                        .Background(rowBg)
                                        .BorderBottom(1).BorderColor(BorderCell)
                                        .PaddingHorizontal(10).PaddingVertical(10);

                                    if (isNumeric)
                                        cell.AlignRight()
                                            .Text(displayValue).FontSize(9f).FontColor(valueColor);
                                    else
                                        cell.AlignLeft()
                                            .Text(displayValue).FontSize(9f).FontColor(valueColor);
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
                        var totalFormat = "N" + Math.Max(0, options.CurrencyDecimalPlaces);

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
                                    .Text($"Rs {total.ToString(totalFormat, culture)}")
                                    .Bold().FontSize(13).FontColor(total < 0 ? NegativeFg : Colors.White);
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

                // ── FOOTER (shared chrome) ────────────────────────────────
                page.Footer().Element(c => RenderFooter(c, options, reportRef));
            });
        });

        return document.GeneratePdf();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  BRANDED DOCUMENT  —  CreateDocument
    // ════════════════════════════════════════════════════════════════════════
    public byte[] CreateDocument(HamzaTexDocumentModel model, PdfOptions? options = null)
    {
        options ??= new PdfOptions();
        var logoPath = options.LogoPath
            ?? Path.Combine(AppContext.BaseDirectory, "assets", "business-card.png");
        var hasLogo = File.Exists(logoPath);
        var dateLine = $"Issued {model.IssuedDate:dd MMM yyyy}";

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(TextPrimary));

                page.Header().Element(c => RenderHeader(c, options, logoPath, hasLogo,
                    stampLabel: model.DocumentLabel, refText: model.Reference, dateLine: dateLine));

                page.Content().PaddingHorizontal(1f, Unit.Centimetre).PaddingVertical(10).Column(column =>
                {
                    column.Spacing(10);

                    // Prepared-for + period block
                    if (!string.IsNullOrWhiteSpace(model.PreparedFor))
                        column.Item().Element(c => RenderPreparedForBlock(c, model));

                    // Stat cards
                    if (model.Stats.Count > 0)
                    {
                        column.Item().Row(row =>
                        {
                            foreach (var s in model.Stats)
                                row.RelativeItem().PaddingRight(6).Element(c => RenderStatCard(c, s));
                        });
                    }

                    // Sections
                    foreach (var section in model.Sections)
                    {
                        column.Item().Element(c => RenderSectionHeader(c, section.Title));
                        column.Item().Element(c => RenderSectionTable(c, section));
                    }

                    // Closing box
                    if (model.Closing is not null)
                        column.Item().Element(c => RenderClosingBox(c, model.Closing));

                    if (!string.IsNullOrWhiteSpace(model.ClosingNote))
                        column.Item().Text(model.ClosingNote).Italic().FontSize(8).FontColor(TextMuted);
                });

                page.Footer().Element(c => RenderFooter(c, options, model.Reference));
            });
        }).GeneratePdf();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  SHARED CHROME  —  used by both CreatePdf and CreateDocument
    // ════════════════════════════════════════════════════════════════════════
    private static void RenderHeader(IContainer c, PdfOptions options, string logoPath, bool hasLogo, string stampLabel, string refText, string dateLine)
    {
        c.Column(col =>
        {
            // ── Banner ──────────────────────────────────────────────
            col.Item().Background(NavyDark)
               .PaddingVertical(12).PaddingHorizontal(1.5f, Unit.Centimetre)
               .Row(row =>
            {
                if (hasLogo)
                {
                    row.ConstantItem(96).Border(0.75f).BorderColor(TealAccent).Padding(2).Image(logoPath);
                    row.ConstantItem(12); // spacer
                }

                row.RelativeItem().AlignMiddle().Column(x =>
                {
                    x.Item().Text(options.BusinessName).Bold().FontSize(22).FontColor(Colors.White);
                    x.Item().PaddingTop(3).Text(options.BusinessTagline)
                       .FontSize(8.5f).FontColor(TealLight).Italic();
                });

                row.ConstantItem(116).AlignRight().Column(x =>
                {
                    // Stamp (OFFICIAL REPORT / CLIENT DOSSIER / INVOICE …)
                    x.Item().AlignRight().Width(112)
                       .Border(0.75f).BorderColor(TealAccent)
                       .PaddingHorizontal(9).PaddingVertical(4).AlignCenter()
                       .Text(stampLabel).Bold().FontSize(7.5f).FontColor(TealLight);

                    x.Item().PaddingTop(8).AlignRight()
                       .Text(refText).Bold().FontSize(10).FontColor(Colors.White);
                    x.Item().PaddingTop(2).AlignRight()
                       .Text(dateLine).FontSize(8).FontColor(TealLight);
                });
            });

            // ── Contact strip ───────────────────────────────────────
            var contactParts = BuildContactParts(options);
            if (contactParts.Count > 0)
            {
                col.Item().Background(NavyMedium)
                   .PaddingHorizontal(1.5f, Unit.Centimetre).PaddingVertical(7)
                   .Text(string.Join("   |   ", contactParts))
                   .FontSize(8).FontColor(TealLight);
            }

            // ── Teal rule + breathing space ─────────────────────────
            col.Item().Height(4).Background(TealAccent);
            col.Item().Height(8);
        });
    }

    private static void RenderFooter(IContainer c, PdfOptions options, string refText)
    {
        c.Column(col =>
        {
            col.Item().Height(3).Background(TealAccent); // separator under the body
            col.Item()
               .PaddingTop(6).PaddingHorizontal(1f, Unit.Centimetre).PaddingBottom(10)
               .Row(row =>
            {
                row.RelativeItem().AlignMiddle()
                   .Text($"{options.BusinessName}  —  Confidential")
                   .FontSize(8).FontColor(TextMuted).Italic();

                row.ConstantItem(140).AlignCenter().AlignMiddle()
                   .Text($"Ref: {refText}").FontSize(7).FontColor(TextMuted);

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
    }

    private static void RenderStatCard(IContainer c, Stat s)
    {
        c.Background(Colors.White)
         .Border(0.5f).BorderColor(BorderCell)
         .BorderTop(2).BorderColor(s.Highlight ? TealAccent : NavyMedium)
         .Padding(8)
         .Column(x =>
         {
             x.Item().Text(s.Label.ToUpper()).FontSize(7).FontColor(TextMuted);
             x.Item().PaddingTop(3).Text(s.Value)
                .Bold().FontSize(12).FontColor(s.Highlight ? TealAccent : NavyDark);
         });
    }

    private static void RenderPreparedForBlock(IContainer c, HamzaTexDocumentModel m)
    {
        c.Row(row =>
        {
            row.RelativeItem(0.55f).Column(x =>
            {
                x.Item().BorderBottom(0.6f).BorderColor(TealAccent).PaddingBottom(3)
                      .Text("PREPARED FOR").Bold().FontSize(9).FontColor(TealAccent);
                x.Item().PaddingTop(6).Text(m.PreparedFor).FontSize(14).Bold().FontColor(NavyDark);
                x.Item().Text(m.PreparedForSubtitle).FontSize(8.5f).FontColor(TextSecondary);
            });
            row.RelativeItem(0.45f).Column(x =>
            {
                x.Item().BorderBottom(0.6f).BorderColor(TealAccent).PaddingBottom(3)
                      .Text(m.PeriodLabel).Bold().FontSize(9).FontColor(TealAccent);
                x.Item().PaddingTop(6).Text(m.PeriodValue).FontSize(10).FontColor(TextPrimary);
                x.Item().Text("All amounts in PKR (Rs)").FontSize(8.5f).FontColor(TextSecondary);
            });
        });
    }

    private static void RenderSectionHeader(IContainer c, string title)
    {
        c.BorderBottom(0.6f).BorderColor(TealAccent).PaddingBottom(3)
         .Text(title.ToUpper()).Bold().FontSize(9).FontColor(TealAccent);
    }

    private static void RenderSectionTable(IContainer c, TableSection s)
    {
        var rightCols = new HashSet<int>(s.RightAlign ?? Array.Empty<int>());

        c.Border(0.4f).BorderColor(BorderCell).Table(t =>
        {
            t.ColumnsDefinition(cd =>
            {
                foreach (var _ in s.Headers) cd.RelativeColumn();
            });

            // Header row
            t.Header(h =>
            {
                for (int i = 0; i < s.Headers.Length; i++)
                {
                    var hc = h.Cell().Background(NavyDark)
                                .BorderBottom(1.2f).BorderColor(TealAccent)
                                .PaddingVertical(6).PaddingHorizontal(8).AlignMiddle();
                    (rightCols.Contains(i) ? hc.AlignRight() : hc.AlignLeft())
                        .Text(s.Headers[i]).Bold().FontSize(8).FontColor(Colors.White);
                }
            });

            int rowIndex = 0;
            foreach (var row in s.Rows)
            {
                var bg = rowIndex % 2 == 0 ? RowOdd : RowEven;
                for (int i = 0; i < row.Length; i++)
                {
                    var cell = t.Cell().Background(bg)
                                .BorderBottom(0.25f).BorderColor(BorderCell)
                                .PaddingVertical(5).PaddingHorizontal(8);
                    var aligned = rightCols.Contains(i) ? cell.AlignRight() : cell.AlignLeft();
                    var isNegative = rightCols.Contains(i)
                                     && !string.IsNullOrEmpty(row[i])
                                     && row[i].Contains('-');
                    aligned.Text(row[i]).FontSize(8.8f).FontColor(isNegative ? NegativeFg : TextPrimary);
                }
                rowIndex++;
            }
        });
    }

    private static void RenderClosingBox(IContainer c, ClosingSummary cs)
    {
        c.Background(NavyDark).BorderTop(2).BorderColor(TealAccent)
         .PaddingVertical(14).PaddingHorizontal(16)
         .Row(r =>
         {
             r.RelativeItem(0.55f).Column(x =>
             {
                 x.Item().Text(cs.LeftLabel).FontSize(8).FontColor(TealLight);
                 x.Item().Text(cs.LeftSubtitle).FontSize(9).FontColor(Colors.White);
             });
             r.RelativeItem(0.45f).AlignRight().Column(x =>
             {
                 x.Item().AlignRight().Text(cs.RightLabel).FontSize(8).FontColor(TealLight);
                 x.Item().AlignRight().Text(cs.RightValue).Bold().FontSize(20).FontColor(Colors.White);
             });
         });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ════════════════════════════════════════════════════════════════════════
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

    private static string FormatValue(object? value, PdfColumnFormat format, string currencyCulture = "en-PK", int currencyDecimals = 0)
    {
        if (value is null) return "—";
        return format switch
        {
            PdfColumnFormat.Currency   => FormatCurrency(value, currencyCulture, currencyDecimals),
            PdfColumnFormat.Date       => FormatDate(value),
            PdfColumnFormat.Boolean    => value is bool b ? (b ? "Yes" : "No") : value.ToString() ?? "—",
            PdfColumnFormat.Percentage => FormatPercentage(value),
            _                          => value.ToString() ?? "—"
        };
    }

    private static string FormatCurrency(object value, string currencyCulture = "en-PK", int decimals = 0)
    {
        // Delegates to the shared PdfFormat helper so list exports and branded docs match.
        return value switch
        {
            decimal d  => PdfFormat.Rs(d, decimals),
            double dbl => PdfFormat.Rs((decimal)dbl, decimals),
            float f    => PdfFormat.Rs((decimal)f, decimals),
            int i      => PdfFormat.Rs(i, decimals),
            long l     => PdfFormat.Rs(l, decimals),
            _          => value.ToString() ?? "—"
        };
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

    private static bool IsNegative(object? val) => val switch
    {
        decimal d  => d < 0,
        double dbl => dbl < 0,
        float f    => f < 0,
        int i      => i < 0,
        long l     => l < 0,
        _          => false
    };
}
