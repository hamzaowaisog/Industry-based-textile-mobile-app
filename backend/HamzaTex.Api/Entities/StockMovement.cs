using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ProductId), Name = "IX_stock_movements_product_id")]
[Index(nameof(MovementTypeId), Name = "IX_stock_movements_movement_type_id")]
[Index(nameof(MovementSourceId), Name = "IX_stock_movements_movement_source_id")]
[Index(nameof(MovementDate), Name = "IX_stock_movements_movement_date")]
[Index(nameof(ProductId), nameof(MovementDate), Name = "IX_stock_movements_product_date")]
public partial class StockMovement
{
    public Guid Id { get; set; }

    public Guid? ProductId { get; set; }

    public Guid? MovementTypeId { get; set; }

    public Guid? MovementSourceId { get; set; }

    public int Qty { get; set; }

    public decimal? UnitCost { get; set; }

    public decimal? UnitPrice { get; set; }

    public DateOnly MovementDate { get; set; }

    public virtual Product? Product { get; set; }
    public virtual MovementType? MovementType { get; set; }
    public virtual MovementSource? MovementSource { get; set; }
}
