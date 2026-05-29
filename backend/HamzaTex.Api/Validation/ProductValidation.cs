using System.Data;
using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public sealed class ProductCreateViewModelValidation : AbstractValidator<ProductCreateViewModel>
{
    public ProductCreateViewModelValidation()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(255)
            .WithMessage("Name is Name must be less than 255 characters");
        RuleFor(x => x.Quantity)
            .NotEmpty()
            .WithMessage("Quantity is required")
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0");
        RuleFor(x => x.Sku)
            .NotEmpty()
            .WithMessage("SKU is required")
            .MaximumLength(255)
            .WithMessage("SKU is SKU must be less than 255 characters");
        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required")
            .MaximumLength(255)
            .WithMessage("Unit is Unit must be less than 255 characters");
        RuleFor(x => x.DefaultCost)
            .NotEmpty()
            .WithMessage("Default cost is required")
            .GreaterThan(0)
            .WithMessage("Default cost must be greater than 0");
        RuleFor(x => x.DefaultPrice)
            .NotEmpty()
            .WithMessage("Default price is required")
            .GreaterThan(0)
            .WithMessage("Default price must be greater than 0");
        RuleFor(x => x.ReorderLevel)
            .NotEmpty()
            .WithMessage("Reorder level is required")
            .GreaterThan(0)
            .WithMessage("Reorder level must be greater than 0");
    }
}

public sealed class ProductUpdateViewModelValidation : AbstractValidator<ProductUpdateViewModel>
{
    public ProductUpdateViewModelValidation()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(255)
            .WithMessage("Name is Name must be less than 255 characters");
        RuleFor(x => x.Sku)
            .NotEmpty()
            .WithMessage("SKU is required")
            .MaximumLength(255)
            .WithMessage("SKU is SKU must be less than 255 characters");
        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required")
            .MaximumLength(255)
            .WithMessage("Unit is Unit must be less than 255 characters");
        RuleFor(x => x.DefaultCost)
            .NotEmpty()
            .WithMessage("Default cost is required")
            .GreaterThan(0)
            .WithMessage("Default cost must be greater than 0");
        RuleFor(x => x.DefaultPrice)
            .NotEmpty()
            .WithMessage("Default price is required")
            .GreaterThan(0)
            .WithMessage("Default price must be greater than 0");
        RuleFor(x => x.ReorderLevel)
            .NotEmpty()
            .WithMessage("Reorder level is required")
            .GreaterThan(0)
            .WithMessage("Reorder level must be greater than 0");
        
    }
}