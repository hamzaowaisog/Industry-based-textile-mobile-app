using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(InvoiceId), Name = "IX_invoice_lines_invoice_id")]
public partial class InvoiceLine
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int InvoiceId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public decimal Qty { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int Version { get; set; } = 1;

    public virtual Invoice Invoice { get; set; } = null!;
}
