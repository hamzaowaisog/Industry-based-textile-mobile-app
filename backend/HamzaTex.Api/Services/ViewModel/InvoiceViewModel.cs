namespace HamzaTex.Api.Services.ViewModel;

public class InvoiceCreateViewModel
{
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public int ClientId { get; set; }
    public DateOnly? DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public List<InvoiceLineCreateViewModel> Lines { get; set; } = [];
}

public class InvoiceLineCreateViewModel
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

public class InvoiceUpdateViewModel
{
    public int? InvoiceStatusId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? Notes { get; set; }
    public decimal? TotalAmount { get; set; }
    public List<InvoiceLineCreateViewModel>? Lines { get; set; }
}
