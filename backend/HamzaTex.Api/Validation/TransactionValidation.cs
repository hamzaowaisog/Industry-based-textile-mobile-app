using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class TransactionCreateViewModelValidation : AbstractValidator<TransactionCreateViewModel>
{
    public TransactionCreateViewModelValidation()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0.");

        RuleFor(x => x.TransCategoryId)
            .GreaterThan(0).WithMessage("TransCategoryId is required.");

        RuleFor(x => x.TransDate)
            .NotEmpty().WithMessage("TransDate is required.");
    }
}

public class TransactionUpdateViewModelValidation : AbstractValidator<TransactionUpdateViewModel>
{
    public TransactionUpdateViewModelValidation()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0.");

        RuleFor(x => x.TransCategoryId)
            .GreaterThan(0).WithMessage("TransCategoryId is required.");

        RuleFor(x => x.TransDate)
            .NotEmpty().WithMessage("TransDate is required.");
    }
}
