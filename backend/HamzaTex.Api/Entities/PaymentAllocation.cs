using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(PaymentId), Name = "IX_payment_allocations_payment_id")]
[Index(nameof(OrderId), Name = "IX_payment_allocations_order_id")]
[Index(nameof(PurchaseId), Name = "IX_payment_allocations_purchase_id")]
[Index(nameof(InvoiceId), Name = "IX_payment_allocations_invoice_id")]
public partial class PaymentAllocation
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int PaymentId { get; set; }

    public int? OrderId { get; set; }

    public int? PurchaseId { get; set; }

    public decimal AllocatedAmount { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int Version { get; set; } = 1;

    public int? InvoiceId { get; set; }

    public virtual Payment Payment { get; set; } = null!;
    public virtual Order? Order { get; set; }
    public virtual Purchase? Purchase { get; set; }

    public virtual Invoice? Invoice { get; set; }
}
