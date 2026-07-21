using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class SettingsUpdateViewModelValidation : AbstractValidator<SettingsUpdateViewModel>
{
    public SettingsUpdateViewModelValidation()
    {
        RuleFor(x => x.HijriOffsetDays).InclusiveBetween(-2, 2);
    }
}
