using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ProductId), Name = "IX_stock_movements_product_id")]
[Index(nameof(MovementTypeId), Name = "IX_stock_movements_movement_type_id")]
[Index(nameof(MovementSourceId), Name = "IX_stock_movements_movement_source_id")]
[Index(nameof(MovementDate), Name = "IX_stock_movements_movement_date")]
[Index(nameof(ProductId), nameof(MovementDate), Name = "IX_stock_movements_product_date")]
public partial class StockMovement
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int? ProductId { get; set; }

    public int? MovementTypeId { get; set; }

    public int? MovementSourceId { get; set; }

    public decimal? Qty { get; set; }

    public decimal? UnitCost { get; set; }

    public decimal? UnitPrice { get; set; }

    public decimal? AverageCostAtMovement { get; set; }

    public decimal? AveragePriceAtMovement { get; set; }

    public DateOnly MovementDate { get; set; }

    /// <summary>Hijri equivalent of MovementDate, "yyyy-MM-dd" in Hijri terms.</summary>
    public string? MovementDateHijri { get; set; }

    /// <summary>
    /// Persisted AverageDimensionOverride so history replays know which pool
    /// (Cost or Price) each movement targeted. Null = auto-derived from MovementType.
    /// </summary>
    public int? AverageDimensionOverride { get; set; }

    public virtual Product? Product { get; set; }
    public virtual MovementType? MovementType { get; set; }
    public virtual MovementSource? MovementSource { get; set; }
}
