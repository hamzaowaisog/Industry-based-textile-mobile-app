namespace HamzaTex.Api.Services.ViewModel;

public class OrderCreateViewModel
{
    public int ClientId { get; set; }
    public int PaymentTypeId { get; set; }
    /// <summary>Omit or null to use the current UTC date.</summary>
    public DateOnly? OrderDate { get; set; }
    public string? Notes { get; set; }
    public List<OrderLineCreateViewModel> Lines { get; set; } = new();
}

public class OrderLineCreateViewModel
{
    public int ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

public class OrderUpdateViewModel
{
    public int StatusId { get; set; }
    /// <summary>Omit or null to leave the existing payment type unchanged.</summary>
    public int? PaymentTypeId { get; set; }
    public string? Notes { get; set; }
    /// <summary>Omit or null to leave the existing order date unchanged.</summary>
    public DateOnly? OrderDate { get; set; }
}
