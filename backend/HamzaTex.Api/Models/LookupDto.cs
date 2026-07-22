namespace HamzaTex.Api.Models;

/// <summary>Generic shape for all seeded lookup / enum-style tables.</summary>
public class LookupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Combined payload returned by GET /api/Lookups/all.
/// Frontend fetches this once at startup and caches locally.
/// </summary>
public class LookupsAllDto
{
    public List<LookupDto> OrderStatuses { get; set; } = [];
    public List<LookupDto> PurchaseStatuses { get; set; } = [];
    public List<LookupDto> PaymentTypes { get; set; } = [];
    public List<LookupDto> PaymentDirections { get; set; } = [];
    public List<LookupDto> TransTypes { get; set; } = [];
    public List<LookupDto> TransModes { get; set; } = [];
    public List<LookupDto> TransCategories { get; set; } = [];
    public List<LookupDto> ExpenseTypes { get; set; } = [];
    public List<LookupDto> MovementTypes { get; set; } = [];
    public List<LookupDto> MovementSources { get; set; } = [];
    public List<LookupDto> ClientTypes { get; set; } = [];
    public List<LookupDto> UserRoles { get; set; } = [];
    public List<LookupDto> InvoiceStatuses { get; set; } = [];
    public List<LookupDto> Units { get; set; } = [];
    public List<LookupDto> HijriMonths { get; set; } = [];
}
