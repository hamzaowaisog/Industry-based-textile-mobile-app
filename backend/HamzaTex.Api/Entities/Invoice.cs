using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ClientId), Name = "IX_invoices_client_id")]
[Index(nameof(OrderId), Name = "IX_invoices_order_id")]
[Index(nameof(PurchaseId), Name = "IX_invoices_purchase_id")]
[Index(nameof(InvoiceStatusId), Name = "IX_invoices_status_id")]
[Index(nameof(InvoiceNumber), Name = "IX_invoices_number", IsUnique = true)]
public partial class Invoice
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public int? OrderId { get; set; }

    public int? PurchaseId { get; set; }

    public int? ClientId { get; set; }

    public int InvoiceStatusId { get; set; }

    public DateOnly? IssueDate { get; set; }

    /// <summary>Hijri equivalent of IssueDate, "yyyy-MM-dd" in Hijri terms.</summary>
    public string? IssueDateHijri { get; set; }

    public DateOnly? DueDate { get; set; }

    /// <summary>Hijri equivalent of DueDate, "yyyy-MM-dd" in Hijri terms.</summary>
    public string? DueDateHijri { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }

    public int? CreatedByUserId { get; set; }

    public DateOnly CreatedAt { get; set; }

    public virtual Order? Order { get; set; }
    public virtual Purchase? Purchase { get; set; }
    public virtual Client? Client { get; set; }
    public virtual InvoiceStatus? InvoiceStatus { get; set; }
    public virtual ApplicationUser? CreatedByUser { get; set; }
    public virtual ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<PaymentAllocation> PaymentAllocations { get; set; } = new List<PaymentAllocation>();
}
