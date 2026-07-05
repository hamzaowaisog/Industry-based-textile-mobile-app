using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class PaymentCreateViewModelValidation : AbstractValidator<PaymentCreateViewModel>
{
    public PaymentCreateViewModelValidation()
    {
        RuleFor(x => x.PartyClientId).GreaterThan(0).WithMessage("Client is required.");
        RuleFor(x => x.PaymentDirectionId).InclusiveBetween(1, 3).WithMessage("Payment direction must be 1 (Received), 2 (Paid), or 3 (Adjustment).");
        RuleFor(x => x.TransModeId).InclusiveBetween(1, 3).WithMessage("Transaction mode must be 1 (Cash), 2 (Bank), or 3 (Credit).");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleForEach(x => x.Allocations).ChildRules(a =>
        {
            // Only validate items that are actually filled in (0 treated same as null/omitted)
            a.When(x => (x.OrderId ?? 0) > 0 || (x.PurchaseId ?? 0) > 0 || x.AllocatedAmount > 0, () =>
            {
                a.RuleFor(x => x)
                    .Must(x => ((x.OrderId ?? 0) > 0) != ((x.PurchaseId ?? 0) > 0))
                    .WithMessage("Each allocation must have either an OrderId or a PurchaseId, not both.");
                a.RuleFor(x => x.AllocatedAmount).GreaterThan(0).WithMessage("Allocated amount must be greater than zero.");
            });
        });

        RuleFor(x => x).Must(x =>
        {
            var allocations = x.Allocations ?? new List<AllocationItemViewModel>();
            return allocations.Count == 0 || allocations.Sum(a => a.AllocatedAmount) <= x.Amount;
        })
            .WithMessage("Total allocated amount cannot exceed the payment amount.");
    }
}

public class PaymentUpdateViewModelValidation : AbstractValidator<PaymentUpdateViewModel>
{
    public PaymentUpdateViewModelValidation()
    {
        RuleFor(x => x.TransModeId).InclusiveBetween(1, 3).WithMessage("Transaction mode must be 1 (Cash), 2 (Bank), or 3 (Credit).");
    }
}

public class ReverseAndCorrectViewModelValidation : AbstractValidator<ReverseAndCorrectViewModel>
{
    public ReverseAndCorrectViewModelValidation()
    {
        RuleFor(x => x.CorrectClientId).GreaterThan(0).WithMessage("Correct client is required.");
    }
}
