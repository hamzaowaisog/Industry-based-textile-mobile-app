namespace HamzaTex.Api.Models;

public class PurchaseDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int StatusId { get; set; }
    public string? StatusName { get; set; }
    public int PaymentTypeId { get; set; }
    public string? PaymentTypeName { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public decimal Total { get; set; }
    public List<PurchaseLineDto> PurchaseLines { get; set; } = [];
}

public class PurchaseLineDto
{
    public int Id { get; set; }
    public int PurchaseId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitCost { get; set; }
}

public class CreatePurchaseDto
{
    public int SupplierId { get; set; }
    public int PaymentTypeId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public List<CreatePurchaseLineDto> Lines { get; set; } = [];
}

public class CreatePurchaseLineDto
{
    public int ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitCost { get; set; }
}

public class UpdatePurchaseDto
{
    public int StatusId { get; set; }
    public int PaymentTypeId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
}
