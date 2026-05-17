using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

public partial class PurchaseLine
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int PurchaseId { get; set; }

    public int? ProductId { get; set; }

    public decimal Qty { get; set; }

    public decimal UnitCost { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int Version { get; set; } = 1;

    public virtual Product? Product { get; set; }

    public virtual Purchase Purchase { get; set; } = null!;
}
