using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class InvoiceCreateViewModelValidation : AbstractValidator<InvoiceCreateViewModel>
{
    public InvoiceCreateViewModelValidation()
    {
        RuleFor(x => x.ClientId).GreaterThan(0).WithMessage("ClientId must be a valid ID.");
        RuleFor(x => x.TotalAmount).GreaterThan(0).WithMessage("TotalAmount must be greater than 0.");
        RuleFor(x => x).Must(x => x.OrderId is null || x.PurchaseId is null)
            .WithMessage("An invoice cannot be linked to both an Order and a Purchase.");
    }
}

public class InvoiceUpdateViewModelValidation : AbstractValidator<InvoiceUpdateViewModel>
{
    public InvoiceUpdateViewModelValidation()
    {
        When(x => x.TotalAmount.HasValue, () =>
            RuleFor(x => x.TotalAmount!.Value).GreaterThan(0).WithMessage("TotalAmount must be greater than 0."));
    }
}
