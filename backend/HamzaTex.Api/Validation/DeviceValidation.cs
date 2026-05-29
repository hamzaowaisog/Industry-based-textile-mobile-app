using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class RegisterDeviceViewModelValidation : AbstractValidator<RegisterDeviceViewModel>
{
    public RegisterDeviceViewModelValidation()
    {
        RuleFor(x => x.PushToken)
            .NotEmpty().WithMessage("PushToken is required.");

        RuleFor(x => x.DeviceType)
            .NotEmpty().WithMessage("DeviceType is required.")
            .Must(t => t == "ios" || t == "android")
            .WithMessage("DeviceType must be 'ios' or 'android'.");
    }
}

public class UnregisterDeviceViewModelValidation : AbstractValidator<UnregisterDeviceViewModel>
{
    public UnregisterDeviceViewModelValidation()
    {
        RuleFor(x => x.PushToken)
            .NotEmpty().WithMessage("PushToken is required.");
    }
}
