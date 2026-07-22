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

        RuleFor(x => x.TransDateHijri)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").WithMessage("TransDateHijri must be in yyyy-MM-dd format")
            .When(x => !string.IsNullOrEmpty(x.TransDateHijri));
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
