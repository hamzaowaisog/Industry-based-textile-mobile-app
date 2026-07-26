namespace HamzaTex.Api.Models;

public class PaymentAllocationDto
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public decimal AllocatedAmount { get; set; }

    /// <summary>Bill No of the linked Order or Purchase for this allocation.</summary>
    public string? BillNo { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int? PartyClientId { get; set; }
    public string? PartyClientName { get; set; }
    public int? PaymentDirectionId { get; set; }
    public string? PaymentDirectionName { get; set; }
    public int? TransModeId { get; set; }
    public string? TransModeName { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? PaymentDateHijri { get; set; }
    public string? PaymentDateHijriDisplay { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public int? UserId { get; set; }
    public string? RecordedByName { get; set; }
    public bool IsReversed { get; set; }
    public int? ReversedByPaymentId { get; set; }
    public int? OriginalPaymentId { get; set; }
    public bool IsCashSettled { get; set; }
    public List<PaymentAllocationDto> Allocations { get; set; } = new();

    /// <summary>All linked Bill Nos, comma-separated, for flat table displays (PDF list export). Empty string if unallocated.</summary>
    public string AllocatedBillNos { get; set; } = string.Empty;

    /// <summary>Portion of Amount not yet applied to any Order/Purchase (e.g. released by a cancelled order/purchase). Available as credit.</summary>
    public decimal UnallocatedAmount { get; set; }
}

public class AllocationItemDto
{
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public decimal AllocatedAmount { get; set; }
}

public class CreatePaymentDto
{
    public int PartyClientId { get; set; }
    public int PaymentDirectionId { get; set; }
    public int TransModeId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? PaymentDateHijri { get; set; }
    public string? Notes { get; set; }
    public List<AllocationItemDto> Allocations { get; set; } = new();
}

public class UpdatePaymentDto
{
    public int TransModeId { get; set; }
    public DateOnly? PaymentDate { get; set; }
    public string? Notes { get; set; }
}

public class ReverseAndCorrectPaymentDto
{
    public int CorrectClientId { get; set; }
    public string? Notes { get; set; }
}

public class UnallocatedCreditDto
{
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public decimal UnallocatedAmount { get; set; }
}

public class PaymentSummaryDto
{
    public decimal TotalReceived { get; set; }
    public decimal TotalPaid { get; set; }
    public int TotalCount { get; set; }
}
