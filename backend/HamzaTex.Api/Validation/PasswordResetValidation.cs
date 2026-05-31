using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class ForgotPasswordViewModelValidation : AbstractValidator<ForgotPasswordViewModel>
{
    public ForgotPasswordViewModelValidation()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");
    }
}

public class VerifyOtpViewModelValidation : AbstractValidator<VerifyOtpViewModel>
{
    public VerifyOtpViewModelValidation()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Verification code is required.")
            .Matches(@"^\d{6}$").WithMessage("Code must be exactly 6 digits.");
    }
}

public class ResetPasswordWithTokenViewModelValidation : AbstractValidator<ResetPasswordWithTokenViewModel>
{
    public ResetPasswordWithTokenViewModelValidation()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");
        RuleFor(x => x.ResetToken)
            .NotEmpty().WithMessage("Reset token is required.");
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.");
        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Please confirm your password.")
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}
