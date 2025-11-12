using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Purchase
{
    public Guid Id { get; set; }

    public Guid? SupplierId { get; set; }
    
    public Guid? PaymentTypeId { get; set; }

    public DateOnly PurchaseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<PurchaseLine> PurchaseLines { get; set; } = new List<PurchaseLine>();

    public virtual Client? Supplier { get; set; }
    
    public virtual PaymentType? PaymentType { get; set; }
}
