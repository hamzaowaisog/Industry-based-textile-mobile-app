namespace HamzaTex.Api.Models;

/// <summary>
/// Statement / dossier document model consumed by <c>PdfService.CreateDocument</c>.
/// (Multi-section branded documents — invoices, statements, dossiers, reports.)
/// </summary>
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
