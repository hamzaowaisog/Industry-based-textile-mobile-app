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

    /// <summary>
    /// 1 = Purchase (auto In), 2 = Sale (auto Out), 3 = Manual (MovementType required)
    /// </summary>
    public int MovementSource { get; set; }

    /// <summary>
    /// Required only when MovementSource = 3 (Manual).
    /// 1 = In (adds stock), 2 = Out (removes stock), 3 = Adjustment (no qty change, record only).
    /// Ignored for Purchase and Sale — direction is auto-derived.
    /// </summary>
    public int? MovementType { get; set; } = null;

    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; } = null;
    public decimal? UnitPrice { get; set; } = null;
    /// <summary>Omit or null to use the current UTC date.</summary>
    public DateOnly? MovementDate { get; set; }
    /// <summary>Optional Hijri override, "yyyy-MM-dd" in Hijri terms. Omit to auto-compute from MovementDate.</summary>
    public string? MovementDateHijri { get; set; }
}

public class StockMovementsUpdateViewModel
{
    public int ProductId { get; set; }

    /// <summary>1 = Purchase (auto In), 2 = Sale (auto Out), 3 = Manual (MovementType required)</summary>
    public int MovementSource { get; set; }

    /// <summary>Required only when MovementSource = 3 (Manual). 1 = In, 2 = Out, 3 = Adjustment.</summary>
    public int? MovementType { get; set; } = null;

    public decimal Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? UnitPrice { get; set; }
    /// <summary>Omit or null to leave the existing movement date unchanged.</summary>
    public DateOnly? MovementDate { get; set; }
}