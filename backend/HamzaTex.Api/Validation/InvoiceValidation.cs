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
        RuleFor(x => x.DueDateHijri)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").WithMessage("DueDateHijri must be in yyyy-MM-dd format")
            .When(x => !string.IsNullOrEmpty(x.DueDateHijri));

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.Qty).GreaterThan(0).WithMessage("Line Qty must be greater than 0.");
            line.RuleFor(l => l.UnitPrice).GreaterThan(0).WithMessage("Line UnitPrice must be greater than 0.");
        });
    }
}

public class InvoiceUpdateViewModelValidation : AbstractValidator<InvoiceUpdateViewModel>
{
    public InvoiceUpdateViewModelValidation()
    {
        When(x => x.TotalAmount.HasValue, () =>
            RuleFor(x => x.TotalAmount!.Value).GreaterThan(0).WithMessage("TotalAmount must be greater than 0."));

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.Qty).GreaterThan(0).WithMessage("Line Qty must be greater than 0.");
            line.RuleFor(l => l.UnitPrice).GreaterThan(0).WithMessage("Line UnitPrice must be greater than 0.");
        });
    }
}
