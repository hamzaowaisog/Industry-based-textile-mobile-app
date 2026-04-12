using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(SupplierId), Name = "IX_purchases_supplier_id")]
[Index(nameof(StatusId), Name = "IX_purchases_status_id")]
[Index(nameof(PaymentTypeId), Name = "IX_purchases_payment_type_id")]
[Index(nameof(PurchaseDate), Name = "IX_purchases_purchase_date")]
[Index(nameof(SupplierId), nameof(PurchaseDate), Name = "IX_purchases_supplier_date")]
public partial class Purchase
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int? SupplierId { get; set; }

    public int? StatusId { get; set; }

    public int? PaymentTypeId { get; set; }

    public DateOnly PurchaseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<PurchaseLine> PurchaseLines { get; set; } = new List<PurchaseLine>();

    public virtual Client? Supplier { get; set; }

    public virtual PurchaseStatus? Status { get; set; }

    public virtual PaymentType? PaymentType { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
