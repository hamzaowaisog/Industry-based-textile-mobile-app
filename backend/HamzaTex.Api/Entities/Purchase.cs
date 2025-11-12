using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(SupplierId), Name = "IX_purchases_supplier_id")]
[Index(nameof(PaymentTypeId), Name = "IX_purchases_payment_type_id")]
[Index(nameof(PurchaseDate), Name = "IX_purchases_purchase_date")]
[Index(nameof(SupplierId), nameof(PurchaseDate), Name = "IX_purchases_supplier_date")]
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
