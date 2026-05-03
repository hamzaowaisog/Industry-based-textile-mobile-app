namespace HamzaTex.Api.Models;

public class PaymentAllocationDto
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public decimal AllocatedAmount { get; set; }
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
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public int? UserId { get; set; }
    public string? RecordedByName { get; set; }
    public bool IsReversed { get; set; }
    public int? ReversedByPaymentId { get; set; }
    public int? OriginalPaymentId { get; set; }
    public bool IsCashSettled { get; set; }
    public List<PaymentAllocationDto> Allocations { get; set; } = new();
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
