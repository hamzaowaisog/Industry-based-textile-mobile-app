namespace HamzaTex.Api.Services.ViewModel;

public class StockMovementsViewModel
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int MovementSource { get; set; }
    public int MovementType { get; set; }
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal UnitPrice { get; set; }
    public DateOnly MovementDate { get; set; }
}

public class StockMovementsCreateViewModel
{
    public int ProductId { get; set; }
    public int MovementSource { get; set; }
    public int MovementType { get; set; }
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; } = null;
    public decimal? UnitPrice { get; set; } = null;
    public DateOnly MovementDate { get; set; }
}

public class StockMovementsUpdateViewModel
{
    public int ProductId { get; set; }
    public int MovementSource { get; set; }
    public int MovementType { get; set; }
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal UnitPrice { get; set; }
    public DateOnly MovementDate { get; set; }
}