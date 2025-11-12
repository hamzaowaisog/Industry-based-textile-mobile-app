using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class StockMovement
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public Guid MovementTypeId { get; set; }

    public Guid MovementSourceId { get; set; }

    public int Qty { get; set; }

    public decimal? UnitCost { get; set; }

    public decimal? UnitPrice { get; set; }

    public DateOnly MovementDate { get; set; }

    public virtual Product Product { get; set; } = null!;
    public virtual MovementType MovementType { get; set; } = null!;
    public virtual MovementSource MovementSource { get; set; } = null!;
}
