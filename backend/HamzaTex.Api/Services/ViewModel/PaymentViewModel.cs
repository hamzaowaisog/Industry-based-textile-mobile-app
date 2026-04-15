namespace HamzaTex.Api.Services.ViewModel;

public class AllocationItemViewModel
{
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public decimal AllocatedAmount { get; set; }
}

public class PaymentCreateViewModel
{
    public int PartyClientId { get; set; }
    public int PaymentDirectionId { get; set; }
    public int TransModeId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? Notes { get; set; }
    public List<AllocationItemViewModel> Allocations { get; set; } = new();
}

public class PaymentUpdateViewModel
{
    public int TransModeId { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? Notes { get; set; }
}

public class ReverseAndCorrectViewModel
{
    public int CorrectClientId { get; set; }
    public string? Notes { get; set; }
}
