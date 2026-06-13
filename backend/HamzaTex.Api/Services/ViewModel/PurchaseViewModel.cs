namespace HamzaTex.Api.Services.ViewModel;

public class PurchaseCreateViewModel
{
    public int SupplierId { get; set; }
    public int PaymentTypeId { get; set; }
    /// <summary>Omit or null to use the current UTC date.</summary>
    public DateOnly? PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public List<PurchaseLineCreateViewModel> Lines { get; set; } = [];
}

public class PurchaseLineCreateViewModel
{
    public int ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitCost { get; set; }
}

public class PurchaseUpdateViewModel
{
    public int StatusId { get; set; }
    public int PaymentTypeId { get; set; }
    /// <summary>Omit or null to leave the existing purchase date unchanged.</summary>
    public DateOnly? PurchaseDate { get; set; }
    public string? Notes { get; set; }
}

public class PurchaseLinesUpdateViewModel
{
    public List<PurchaseLineCreateViewModel> Lines { get; set; } = [];
}
