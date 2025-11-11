using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Transaction
{
    public Guid Id { get; set; }

    public Guid? ClientId { get; set; }

    public Guid? ProductId { get; set; }

    public Guid? UserId { get; set; }

    public string? LinkedEntity { get; set; }

    public Guid? LinkedId { get; set; }

    public TransType Type { get; set; }

    public TransMode Mode { get; set; }

    public TransCategory Category { get; set; }

    public decimal Amount { get; set; }

    public DateOnly TransDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client? Client { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }
}
