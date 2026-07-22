using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public sealed class OrderCreateViewModelValidation : AbstractValidator<OrderCreateViewModel>
{
    public OrderCreateViewModelValidation()
    {
        RuleFor(x => x.ClientId)
            .GreaterThan(0).WithMessage("ClientId is required");

        RuleFor(x => x.PaymentTypeId)
            .GreaterThan(0).WithMessage("PaymentTypeId is required");

        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("At least one order line is required");

        RuleFor(x => x.OrderDateHijri)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").WithMessage("OrderDateHijri must be in yyyy-MM-dd format")
            .When(x => !string.IsNullOrEmpty(x.OrderDateHijri));

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ProductId)
                .GreaterThan(0).WithMessage("ProductId is required");
            line.RuleFor(l => l.Qty)
                .GreaterThan(0).WithMessage("Qty must be greater than 0");
            line.RuleFor(l => l.UnitPrice)
                .GreaterThan(0).WithMessage("UnitPrice must be greater than 0");
        });
    }
}

public sealed class OrderUpdateViewModelValidation : AbstractValidator<OrderUpdateViewModel>
{
    public OrderUpdateViewModelValidation()
    {
        RuleFor(x => x.StatusId)
            .GreaterThan(0).WithMessage("StatusId is required");

        When(x => x.PaymentTypeId.HasValue, () =>
        {
            RuleFor(x => x.PaymentTypeId)
                .GreaterThan(0).WithMessage("PaymentTypeId must be greater than 0");
        });
    }
}

public sealed class OrderLinesUpdateViewModelValidation : AbstractValidator<OrderLinesUpdateViewModel>
{
    public OrderLinesUpdateViewModelValidation()
    {
        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("At least one order line is required");

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ProductId)
                .GreaterThan(0).WithMessage("ProductId is required");
            line.RuleFor(l => l.Qty)
                .GreaterThan(0).WithMessage("Qty must be greater than 0");
            line.RuleFor(l => l.UnitPrice)
                .GreaterThan(0).WithMessage("UnitPrice must be greater than 0");
        });
    }
}
