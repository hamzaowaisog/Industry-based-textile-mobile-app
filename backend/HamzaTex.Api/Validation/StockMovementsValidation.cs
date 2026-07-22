namespace HamzaTex.Api.Validation;

using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

public sealed class StockMovementsCreateViewModelValidation : AbstractValidator<StockMovementsCreateViewModel>
{
    public StockMovementsCreateViewModelValidation()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Product is required.");

        RuleFor(x => x.MovementSource)
            .InclusiveBetween(1, 3)
            .WithMessage("Movement source must be 1 (Purchase), 2 (Sale), or 3 (Manual).");

        // MovementType is only required when source is Manual (3)
        RuleFor(x => x.MovementType)
            .NotNull()
            .WithMessage("Movement type is required when source is Manual.")
            .InclusiveBetween(1, 3)
            .WithMessage("Movement type must be 1 (In), 2 (Out), or 3 (Adjustment).")
            .When(x => x.MovementSource == 3);

        RuleFor(x => x.Qty)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0)
            .WithMessage("Unit cost must be greater than 0.")
            .When(x => x.UnitCost.HasValue);

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0)
            .WithMessage("Unit price must be greater than 0.")
            .When(x => x.UnitPrice.HasValue);

        RuleFor(x => x.MovementDateHijri)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").WithMessage("MovementDateHijri must be in yyyy-MM-dd format")
            .When(x => !string.IsNullOrEmpty(x.MovementDateHijri));
    }
}

public sealed class StockMovementsUpdateViewModelValidation : AbstractValidator<StockMovementsUpdateViewModel>
{
    public StockMovementsUpdateViewModelValidation()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Product is required.");

        RuleFor(x => x.MovementSource)
            .InclusiveBetween(1, 3)
            .WithMessage("Movement source must be 1 (Purchase), 2 (Sale), or 3 (Manual).");

        // MovementType required only for Manual source
        RuleFor(x => x.MovementType)
            .NotNull()
            .WithMessage("Movement type is required when source is Manual.")
            .InclusiveBetween(1, 3)
            .WithMessage("Movement type must be 1 (In), 2 (Out), or 3 (Adjustment).")
            .When(x => x.MovementSource == 3);

        RuleFor(x => x.Qty)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0)
            .WithMessage("Unit cost must be greater than 0.")
            .When(x => x.UnitCost.HasValue);

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0)
            .WithMessage("Unit price must be greater than 0.")
            .When(x => x.UnitPrice.HasValue);
    }
}