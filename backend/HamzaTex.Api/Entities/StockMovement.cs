using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class StockMovement
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public MovementType MovementType { get; set; }

    public MovementSource Source { get; set; }

    public int Qty { get; set; }

    public decimal? UnitCost { get; set; }

    public decimal? UnitPrice { get; set; }

    public DateOnly MovementDate { get; set; }

    public string? LinkedEntity { get; set; }

    public Guid? LinkedId { get; set; }

    public virtual Product Product { get; set; } = null!;
}
