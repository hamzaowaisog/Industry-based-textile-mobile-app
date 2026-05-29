namespace HamzaTex.Api.Models;

public class StockMovementsDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int MovementSource { get; set; }
    public string? MovementSourceName { get; set; }
    public int MovementType { get; set; }
    public string? MovementTypeName { get; set; }
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? AverageCostAtMovement { get; set; }
    public decimal? AveragePriceAtMovement { get; set; }
    public DateOnly MovementDate { get; set; }
}

public class CreateStockMovementsDto
{
    public int ProductId { get; set; }
    public int MovementSource { get; set; }
    public int? MovementType { get; set; } = null;
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; } = null;
    public decimal? UnitPrice { get; set; } = null;
    public DateOnly MovementDate { get; set; }
}

public class UpdateStockMovementsDto
{
    public int ProductId { get; set; }
    public int MovementSource { get; set; }
    public int? MovementType { get; set; } = null; // Required only for Manual (3)
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? AverageCostAtMovement { get; set; }
    public decimal? AveragePriceAtMovement { get; set; }
    public DateOnly? MovementDate { get; set; }
}