namespace HamzaTex.Api.Validation;

using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

public sealed class StockMovementsCreateViewModelValidation : AbstractValidator<StockMovementsCreateViewModel>
{
    public StockMovementsCreateViewModelValidation()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage("Product is required")
            .GreaterThan(0)
            .WithMessage("Product must be greater than 0");
        RuleFor(x => x.MovementSource)
            .NotEmpty()
            .WithMessage("Movement source is required")
            .GreaterThan(0)
            .WithMessage("Movement source must be greater than 0");
        RuleFor(x => x.MovementType)
            .NotEmpty()
            .WithMessage("Movement type is required")
            .GreaterThan(0)
            .WithMessage("Movement type must be greater than 0");
        RuleFor(x => x.Qty)
            .NotEmpty()
            .WithMessage("Quantity is required")
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0");
    }
}

public sealed class StockMovementsUpdateViewModelValidation : AbstractValidator<StockMovementsUpdateViewModel>
{
    public StockMovementsUpdateViewModelValidation()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage("Product is required")
            .GreaterThan(0)
            .WithMessage("Product must be greater than 0");
        RuleFor(x => x.MovementSource)
            .NotEmpty()
            .WithMessage("Movement source is required")
            .GreaterThan(0)
            .WithMessage("Movement source must be greater than 0");
        RuleFor(x => x.MovementType)
            .NotEmpty()
            .WithMessage("Movement type is required")
            .GreaterThan(0)
            .WithMessage("Movement type must be greater than 0");
        RuleFor(x => x.Qty)
            .NotEmpty()
            .WithMessage("Quantity is required")
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0");
        RuleFor(x => x.UnitCost)
            .NotEmpty()
            .WithMessage("Unit cost is required")
            .GreaterThan(0)
            .WithMessage("Unit cost must be greater than 0");
        RuleFor(x => x.UnitPrice)
            .NotEmpty()
            .WithMessage("Unit price is required")
            .GreaterThan(0)
            .WithMessage("Unit price must be greater than 0");
    }
}