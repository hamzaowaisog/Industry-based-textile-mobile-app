using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Payment
{
    public Guid Id { get; set; }

    public Guid PartyClientId { get; set; }

    public Guid? PaymentDirectionId { get; set; }

    public Guid? TransModeId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client PartyClient { get; set; } = null!;
    public virtual PaymentDirection PaymentDirection { get; set; } = null!;
    public virtual TransMode TransMode { get; set; } = null!;
}
