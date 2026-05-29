// ============================================================================
//  HamzaTexPdf.cs   —   Reusable branded PDF generator (Navy + Gold theme)
//  Library: QuestPDF  (https://www.questpdf.com)
//  Install: dotnet add package QuestPDF
//
//  USAGE:
//      var model = new HamzaTexDocumentModel
//      {
//          DocumentLabel = "CLIENT STATEMENT",
//          Reference     = "HT-20260503-0207",
//          IssuedDate    = DateTime.Now,
//          PreparedFor   = "Abdul Haseeb",
//          PreparedForSubtitle = "Customer · Account #C-0207",
//          PeriodLabel   = "ACCOUNT SUMMARY PERIOD",
//          PeriodValue   = "12 Apr 2026 — 03 May 2026",
//          Stats = new() {
//              new Stat("Orders (1)",    "Rs 3,700,000"),
//              new Stat("Payments In",   "Rs 4,850,000"),
//              new Stat("Payments Out",  "Rs 0"),
//              new Stat("Outstanding",   "Rs 3,000,000", highlight: true),
//          },
//          Sections = new() {
//              new TableSection("Orders",
//                  headers: new[] { "Order #", "Date", "Status", "Total", "Paid", "Outstanding", "Payment" },
//                  rightAlign: new[] { 3, 4, 5 },
//                  rows: ordersFromDb.Select(o => new[] {
//                      o.Number, o.Date, o.Status, o.Total, o.Paid, o.Outstanding, o.PaymentStatus
//                  })),
//              new TableSection("Payments Received", ... ),
//          },
//          Closing = new ClosingSummary("CLOSING BALANCE",
//                                       "As of " + DateTime.Now.ToString("dd MMM yyyy"),
//                                       "AMOUNT DUE", "Rs 3,000,000"),
//          ClosingNote = "Thank you for your continued partnership. ..."
//      };
//
//      byte[] pdfBytes = HamzaTexPdf.Generate(model);
//      // return File(pdfBytes, "application/pdf", "statement.pdf");
// ============================================================================

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HamzaTex.Api.Helpers;

// ─── Brand palette ──────────────────────────────────────────────────────────
public static class Brand
{
    public const string Navy      = "#0B1B33";
    public const string NavyDeep  = "#06101F";
    public const string Gold      = "#C9A24C";
    public const string GoldLight = "#E6CC85";
    public const string Paper     = "#FBF8F1";
    public const string Ink       = "#1A1A1A";
    public const string Muted     = "#6B7280";
    public const string Rule      = "#E5E0D2";
    public const string RowAlt    = "#F5F1E6";

    public const string SerifFont = "Times New Roman";
    public const string SansFont  = "Helvetica";

    // Footer / company info — edit once, applies everywhere
    public const string CompanyName    = "Hamza Tex";
    public const string CompanyTagline = "Weaving Quality, Delivering Trust";
    public const string CompanyAddress = "O.T. 6/18/19, Kagzi Bazar, Karachi";
    public const string CompanyEmail   = "hamzatex007@gmail.com";
    public const string CompanyPhone   = "+92 313 2039333";
}

// ─── Data model ─────────────────────────────────────────────────────────────
public record Stat(string Label, string Value, bool Highlight = false);

public record TableSection(
    string Title,
    string[] Headers,
    IEnumerable<string[]> Rows,
    int[]? RightAlign = null);

public record ClosingSummary(
    string LeftLabel, string LeftSubtitle,
    string RightLabel, string RightValue);

public class HamzaTexDocumentModel
{
    public string DocumentLabel { get; set; } = "DOCUMENT";
    public string Reference     { get; set; } = "";
    public DateTime IssuedDate  { get; set; } = DateTime.Now;

    public string PreparedFor          { get; set; } = "";
    public string PreparedForSubtitle  { get; set; } = "";
    public string PeriodLabel          { get; set; } = "PERIOD";
    public string PeriodValue          { get; set; } = "";

    public List<Stat>          Stats        { get; set; } = new();
    public List<TableSection>  Sections     { get; set; } = new();
    public ClosingSummary?     Closing      { get; set; }
    public string?             ClosingNote  { get; set; }
}

// ─── Generator ──────────────────────────────────────────────────────────────
public static class HamzaTexPdf
{
    public static byte[] Generate(HamzaTexDocumentModel model)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);
                page.PageColor(Brand.Paper);
                page.DefaultTextStyle(t => t.FontFamily(Brand.SansFont).FontSize(9.5f).FontColor(Brand.Ink));

                page.Header().Element(c => HeaderBand(c, model));
                page.Content().PaddingHorizontal(18, Unit.Millimetre)
                              .PaddingVertical(8, Unit.Millimetre)
                              .Element(c => Body(c, model));
                page.Footer().Element(FooterBand);
            });
        }).GeneratePdf();
    }

    // ── Header band (navy + gold) ──────────────────────────────────────────
    static void HeaderBand(IContainer c, HamzaTexDocumentModel m)
    {
        c.Background(Brand.Navy).Height(30, Unit.Millimetre)
         .BorderBottom(0.8f).BorderColor(Brand.Gold)
         .PaddingHorizontal(18, Unit.Millimetre)
         .AlignMiddle()
         .Row(row =>
         {
             row.RelativeItem().Column(col =>
             {
                 col.Item().Text(Brand.CompanyName)
                    .FontFamily(Brand.SerifFont).Bold().FontSize(22).FontColor(Brand.Gold);
                 col.Item().Text(Brand.CompanyTagline)
                    .FontFamily(Brand.SerifFont).Italic().FontSize(9).FontColor(Brand.GoldLight);
             });
             row.ConstantItem(70, Unit.Millimetre).AlignRight().Column(col =>
             {
                 col.Item().AlignRight().Text(m.DocumentLabel)
                    .FontSize(7.5f).LetterSpacing(0.15f).FontColor(Brand.GoldLight);
                 col.Item().AlignRight().Text($"Ref  {m.Reference}")
                    .Bold().FontSize(10.5f).FontColor(Colors.White);
                 col.Item().AlignRight().Text($"Issued  {m.IssuedDate:dd MMM yyyy}")
                    .FontSize(8.5f).FontColor(Brand.GoldLight);
             });
         });
    }

    // ── Footer ─────────────────────────────────────────────────────────────
    static void FooterBand(IContainer c)
    {
        c.PaddingHorizontal(18, Unit.Millimetre).PaddingBottom(8, Unit.Millimetre)
         .Column(col =>
         {
             col.Item().BorderTop(0.4f).BorderColor(Brand.Gold).PaddingTop(4)
                .Row(r =>
                {
                    r.RelativeItem().Text(Brand.CompanyAddress).FontSize(7.5f).FontColor(Brand.Navy);
                    r.RelativeItem().AlignCenter().Text($"{Brand.CompanyEmail}  ·  {Brand.CompanyPhone}")
                       .FontSize(7.5f).FontColor(Brand.Navy);
                    r.RelativeItem().AlignRight().Text(t =>
                    {
                        t.Span("Page ").FontSize(7.5f).FontColor(Brand.Gold);
                        t.CurrentPageNumber().FontSize(7.5f).FontColor(Brand.Gold);
                        t.Span(" / ").FontSize(7.5f).FontColor(Brand.Gold);
                        t.TotalPages().FontSize(7.5f).FontColor(Brand.Gold);
                    });
                });
             col.Item().PaddingTop(2).AlignCenter()
                .Text("Confidential — for the addressed recipient only")
                .Italic().FontSize(6.5f).FontColor(Brand.Muted);
         });
    }

    // ── Body ───────────────────────────────────────────────────────────────
    static void Body(IContainer c, HamzaTexDocumentModel m)
    {
        c.Column(col =>
        {
            col.Spacing(10);

            // Recipient + period
            col.Item().Row(row =>
            {
                row.RelativeItem(0.55f).Column(x =>
                {
                    x.Item().BorderBottom(0.6f).BorderColor(Brand.Gold).PaddingBottom(3)
                            .Text("PREPARED FOR").Bold().FontSize(9).FontColor(Brand.Gold).LetterSpacing(0.2f);
                    x.Item().PaddingTop(6).Text(m.PreparedFor).FontSize(14).Bold().FontColor(Brand.Navy);
                    x.Item().Text(m.PreparedForSubtitle).FontSize(8.5f).FontColor(Brand.Muted);
                });
                row.RelativeItem(0.45f).Column(x =>
                {
                    x.Item().BorderBottom(0.6f).BorderColor(Brand.Gold).PaddingBottom(3)
                            .Text(m.PeriodLabel).Bold().FontSize(9).FontColor(Brand.Gold).LetterSpacing(0.2f);
                    x.Item().PaddingTop(6).Text(m.PeriodValue).FontSize(10).FontColor(Brand.Ink);
                    x.Item().Text("All amounts in PKR (Rs)").FontSize(8.5f).FontColor(Brand.Muted);
                });
            });

            // Stat cards
            if (m.Stats.Count > 0)
            {
                col.Item().Row(row =>
                {
                    foreach (var (s, idx) in m.Stats.Select((s,i)=>(s,i)))
                    {
                        row.RelativeItem().PaddingRight(idx < m.Stats.Count-1 ? 6 : 0)
                           .Element(cell => StatCard(cell, s));
                    }
                });
            }

            // Sections
            foreach (var section in m.Sections)
            {
                col.Item().Element(c2 => SectionHeader(c2, section.Title));
                col.Item().Element(c2 => DataTable(c2, section));
            }

            // Closing summary
            if (m.Closing is not null)
                col.Item().Element(c2 => ClosingBox(c2, m.Closing));

            if (!string.IsNullOrWhiteSpace(m.ClosingNote))
                col.Item().Text(m.ClosingNote).Italic().FontSize(8).FontColor(Brand.Muted);
        });
    }

    static void StatCard(IContainer c, Stat s)
    {
        c.Background(Colors.White)
         .Border(0.5f).BorderColor(Brand.Rule)
         .BorderTop(2).BorderColor(s.Highlight ? Brand.Gold : Brand.Navy)
         .Padding(10)
         .Column(x =>
         {
             x.Item().Text(s.Label.ToUpper())
                .FontSize(7.8f).FontColor(Brand.Muted).LetterSpacing(0.15f);
             x.Item().PaddingTop(4).Text(s.Value)
                .Bold().FontSize(12).FontColor(s.Highlight ? Brand.Gold : Brand.Navy);
         });
    }

    static void SectionHeader(IContainer c, string title)
    {
        c.BorderBottom(0.6f).BorderColor(Brand.Gold).PaddingBottom(3)
         .Text(title.ToUpper()).Bold().FontSize(9).FontColor(Brand.Gold).LetterSpacing(0.2f);
    }

    static void DataTable(IContainer c, TableSection s)
    {
        var rightCols = new HashSet<int>(s.RightAlign ?? Array.Empty<int>());

        c.Border(0.4f).BorderColor(Brand.Rule).Table(t =>
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
                    h.Cell().Background(Brand.Navy)
                            .BorderBottom(1.2f).BorderColor(Brand.Gold)
                            .PaddingVertical(6).PaddingHorizontal(8)
                            .AlignMiddle()
                            .Element(rightCols.Contains(i) ? e => e.AlignRight() : e => e.AlignLeft())
                            .Text(s.Headers[i]).Bold().FontSize(8).FontColor(Colors.White);
                }
            });

            int rowIndex = 0;
            foreach (var row in s.Rows)
            {
                var bg = rowIndex % 2 == 0 ? "#FFFFFF" : Brand.RowAlt;
                for (int i = 0; i < row.Length; i++)
                {
                    var cell = t.Cell().Background(bg)
                                .BorderBottom(0.25f).BorderColor(Brand.Rule)
                                .PaddingVertical(5).PaddingHorizontal(8);
                    var aligned = rightCols.Contains(i) ? cell.AlignRight() : cell.AlignLeft();
                    aligned.Text(row[i]).FontSize(8.8f).FontColor(Brand.Ink);
                }
                rowIndex++;
            }
        });
    }

    static void ClosingBox(IContainer c, ClosingSummary cs)
    {
        c.Background(Brand.Navy).BorderTop(2).BorderColor(Brand.Gold)
         .PaddingVertical(14).PaddingHorizontal(16)
         .Row(r =>
         {
             r.RelativeItem(0.55f).Column(x =>
             {
                 x.Item().Text(cs.LeftLabel).FontSize(8).FontColor(Brand.GoldLight).LetterSpacing(0.15f);
                 x.Item().Text(cs.LeftSubtitle).FontSize(9).FontColor(Colors.White);
             });
             r.RelativeItem(0.45f).AlignRight().Column(x =>
             {
                 x.Item().AlignRight().Text(cs.RightLabel).FontSize(8).FontColor(Brand.GoldLight).LetterSpacing(0.15f);
                 x.Item().AlignRight().Text(cs.RightValue).Bold().FontSize(20).FontColor(Colors.White);
             });
         });
    }
}
