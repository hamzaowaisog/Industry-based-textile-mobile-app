using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(Sku), IsUnique = true, Name = "products_sku_key")]
[Index(nameof(Name), Name = "IX_products_name")]
[Index(nameof(IsActive), Name = "IX_products_is_active")]
[Index(nameof(IsActive), nameof(Name), Name = "IX_products_is_active_name")]
public partial class Product
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Sku { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public decimal? DefaultCost { get; set; }

    public decimal? DefaultPrice { get; set; }

    public int? ReorderLevel { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

    public virtual ICollection<PurchaseLine> PurchaseLines { get; set; } = new List<PurchaseLine>();

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
