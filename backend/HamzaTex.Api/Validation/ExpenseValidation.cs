using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class ExpenseCreateViewModelValidation : AbstractValidator<ExpenseCreateViewModel>
{
    public ExpenseCreateViewModelValidation()
    {
        RuleFor(x => x.ExpenseTypeId).GreaterThan(0).WithMessage("Expense type is required.");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero.");
        RuleFor(x => x.TransModeId).InclusiveBetween(1, 3)
            .WithMessage("Transaction mode must be 1 (Cash), 2 (Bank), or 3 (Credit).");
        RuleFor(x => x.TransCategoryId)
            .GreaterThan(0).WithMessage("Transaction category ID must be greater than zero.")
            .When(x => x.TransCategoryId.HasValue);
    }
}

public class ExpenseUpdateViewModelValidation : AbstractValidator<ExpenseUpdateViewModel>
{
    public ExpenseUpdateViewModelValidation()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero.");
        RuleFor(x => x.TransModeId).InclusiveBetween(1, 3)
            .WithMessage("Transaction mode must be 1 (Cash), 2 (Bank), or 3 (Credit).");
    }
}

public class ExpenseTypeCreateViewModelValidation : AbstractValidator<ExpenseTypeCreateViewModel>
{
    public ExpenseTypeCreateViewModelValidation()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Name).MaximumLength(100).WithMessage("Name must be 100 characters or fewer.");
    }
}

public class ExpenseTypeUpdateViewModelValidation : AbstractValidator<ExpenseTypeUpdateViewModel>
{
    public ExpenseTypeUpdateViewModelValidation()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Name).MaximumLength(100).WithMessage("Name must be 100 characters or fewer.");
    }
}
