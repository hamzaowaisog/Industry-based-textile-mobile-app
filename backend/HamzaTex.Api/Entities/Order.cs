using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Order
{
    public Guid Id { get; set; }

    public Guid ClientId { get; set; }

    public DateOnly OrderDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client Client { get; set; } = null!;

    public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
}
