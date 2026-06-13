namespace HamzaTex.Api.Models;

public class OrderDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public int StatusId { get; set; }
    public string? StatusName { get; set; }
    public int PaymentTypeId { get; set; }
    public string? PaymentTypeName { get; set; }
    public DateOnly OrderDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public decimal Total { get; set; }
    public decimal AmountReceived { get; set; }
    public decimal Receivable { get; set; }
    public string PaymentStatus { get; set; } = "Unpaid";
    public List<OrderLineDto> OrderLines { get; set; } = new();
}

public class OrderLineDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => Qty * UnitPrice;
}

public class CreateOrderDto
{
    public int ClientId { get; set; }
    public int PaymentTypeId { get; set; }
    public DateOnly OrderDate { get; set; }
    public string? Notes { get; set; }
    public List<CreateOrderLineDto> Lines { get; set; } = new();
}

public class CreateOrderLineDto
{
    public int ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdateOrderDto
{
    public int StatusId { get; set; }
    public int? PaymentTypeId { get; set; }
    public string? Notes { get; set; }
    public DateOnly? OrderDate { get; set; }
}
