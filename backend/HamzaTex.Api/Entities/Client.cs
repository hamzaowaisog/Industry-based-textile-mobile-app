using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Client
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public Guid? ClientTypeId { get; set; }

    public int Phone { get; set; }

    public string? Address { get; set; }

    public decimal? CreditLimit { get; set; }

    public decimal? OpeningBalance { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ClientType? ClientType { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
