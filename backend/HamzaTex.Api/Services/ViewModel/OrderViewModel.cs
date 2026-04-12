namespace HamzaTex.Api.Services.ViewModel;

public class OrderCreateViewModel
{
    public int ClientId { get; set; }
    public int PaymentTypeId { get; set; }
    public DateOnly OrderDate { get; set; }
    public string? Notes { get; set; }
    public List<OrderLineCreateViewModel> Lines { get; set; } = new();
}

public class OrderLineCreateViewModel
{
    public int ProductId { get; set; }
    public int Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

public class OrderUpdateViewModel
{
    public int StatusId { get; set; }
    public int PaymentTypeId { get; set; }
    public string? Notes { get; set; }
    public DateOnly OrderDate { get; set; }
}
