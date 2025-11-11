using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class PurchaseLine
{
    public Guid Id { get; set; }

    public Guid PurchaseId { get; set; }

    public Guid ProductId { get; set; }

    public int Qty { get; set; }

    public decimal UnitCost { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual Purchase Purchase { get; set; } = null!;
}
