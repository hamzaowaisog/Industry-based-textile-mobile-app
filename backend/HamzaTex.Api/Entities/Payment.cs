using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Payment
{
    public Guid Id { get; set; }

    public Guid PartyClientId { get; set; }

    public PaymentDirection Direction { get; set; }

    public TransMode Mode { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client PartyClient { get; set; } = null!;
}
