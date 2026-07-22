namespace HamzaTex.Api.Models;

public class StockMovementsDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int UnitId { get; set; }
    public string? UnitName { get; set; }
    public int MovementSource { get; set; }
    public string? MovementSourceName { get; set; }
    public int MovementType { get; set; }
    public string? MovementTypeName { get; set; }
    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? AverageCostAtMovement { get; set; }
    public decimal? AveragePriceAtMovement { get; set; }
    public decimal? CurrentAverageCost { get; set; }
    public decimal? CurrentAveragePrice { get; set; }
    public DateOnly MovementDate { get; set; }
    public string? MovementDateHijri { get; set; }
    public string? MovementDateHijriDisplay { get; set; }
}

/// <summary>Aggregate in/out quantity totals across the full matching stock movement history (not just one page).</summary>
public class StockMovementsSummaryDto
{
    public decimal TotalIn { get; set; }
    public decimal TotalOut { get; set; }
    public string? TotalInUnitLabel { get; set; }
    public string? TotalOutUnitLabel { get; set; }
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
    public string? MovementDateHijri { get; set; }

    /// <summary>
    /// Overrides which weighted average the movement recalculates.
    /// Null = auto-derive from MovementType (In→Cost, Out→Price).
    /// Set explicitly on cancellation-reversal movements where the stock
    /// direction does not match the document type: a purchase cancellation
    /// removes stock (Out) but must adjust Cost; an order cancellation
    /// returns stock (In) but must adjust Price.
    /// </summary>
    public int? AverageDimensionOverride { get; set; } = null;

    /// <summary>
    /// When true, skips the stock-movement notification (used by order/purchase
    /// line loops — those flows send their own document-level notification).
    /// </summary>
    public bool SuppressNotification { get; set; }
}

/// <summary>Average dimensions for <see cref="CreateStockMovementsDto.AverageDimensionOverride"/>.</summary>
public static class StockAverageDimension
{
    public const int Cost = 1;
    public const int Price = 2;
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