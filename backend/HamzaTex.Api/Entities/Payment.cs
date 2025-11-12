using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(PartyClientId), Name = "IX_payments_party_client_id")]
[Index(nameof(PaymentDirectionId), Name = "IX_payments_payment_direction_id")]
[Index(nameof(TransModeId), Name = "IX_payments_trans_mode_id")]
[Index(nameof(PaymentDate), Name = "IX_payments_payment_date")]
[Index(nameof(PartyClientId), nameof(PaymentDate), Name = "IX_payments_client_date")]
public partial class Payment
{
    public Guid Id { get; set; }

    public Guid? PartyClientId { get; set; }

    public Guid? PaymentDirectionId { get; set; }

    public Guid? TransModeId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client? PartyClient { get; set; }
    public virtual PaymentDirection? PaymentDirection { get; set; }
    public virtual TransMode? TransMode { get; set; }
}
