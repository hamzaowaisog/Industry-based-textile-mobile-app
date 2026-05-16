using FluentValidation;
using HamzaTex.Api.Models;

namespace HamzaTex.Api.Validation;

public sealed class BiometricLoginValidation : AbstractValidator<BiometricLoginViewModel>
{
    public BiometricLoginValidation()
    {
        RuleFor(x => x.BiometricToken)
            .NotEmpty().WithMessage("BiometricToken is required");
    }
}
