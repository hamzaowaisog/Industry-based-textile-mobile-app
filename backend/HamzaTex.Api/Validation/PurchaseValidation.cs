using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class PurchaseCreateViewModelValidation : AbstractValidator<PurchaseCreateViewModel>
{
    public PurchaseCreateViewModelValidation()
    {
        RuleFor(x => x.SupplierId).GreaterThan(0).WithMessage("SupplierId is required.");
        RuleFor(x => x.PaymentTypeId).GreaterThan(0).WithMessage("PaymentTypeId is required.");
        RuleFor(x => x.Lines).NotEmpty().WithMessage("At least one purchase line is required.");
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ProductId).GreaterThan(0).WithMessage("ProductId is required.");
            line.RuleFor(l => l.Qty).GreaterThan(0).WithMessage("Qty must be greater than 0.");
            line.RuleFor(l => l.UnitCost).GreaterThan(0).WithMessage("UnitCost must be greater than 0.");
        });
    }
}

public class PurchaseUpdateViewModelValidation : AbstractValidator<PurchaseUpdateViewModel>
{
    public PurchaseUpdateViewModelValidation()
    {
        RuleFor(x => x.StatusId).GreaterThan(0).WithMessage("StatusId is required.");
        RuleFor(x => x.PaymentTypeId).GreaterThan(0).WithMessage("PaymentTypeId is required.");
    }
}

public class PurchaseLinesUpdateViewModelValidation : AbstractValidator<PurchaseLinesUpdateViewModel>
{
    public PurchaseLinesUpdateViewModelValidation()
    {
        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("At least one purchase line is required.");

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ProductId).GreaterThan(0).WithMessage("ProductId is required.");
            line.RuleFor(l => l.Qty).GreaterThan(0).WithMessage("Qty must be greater than 0.");
            line.RuleFor(l => l.UnitCost).GreaterThan(0).WithMessage("UnitCost must be greater than 0.");
        });
    }
}
