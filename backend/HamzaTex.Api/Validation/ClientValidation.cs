using FluentValidation;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public sealed class ClientCreateViewModelValidation : AbstractValidator<ClientCreateViewModel>
{
    public ClientCreateViewModelValidation()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255).WithMessage("Name must be less than 255 characters");
        
        RuleFor(x => x.ClientTypeId)
            .NotEmpty().WithMessage("Client type is required")
            .GreaterThan(0).WithMessage("Client type must be greater than 0");
    }
}

public sealed class ClientUpdateViewModelValidation : AbstractValidator<ClientUpdateViewModel>
{
    public ClientUpdateViewModelValidation()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required")
            .GreaterThan(0).WithMessage("Id must be greater than 0");
        
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255).WithMessage("Name must be less than 255 characters")
            .Must(x => x.Contains(' ')).WithMessage("Name must contain spaces");
        
        RuleFor(x => x.ClientTypeId)
            .NotEmpty().WithMessage("Client type is required")
            .GreaterThan(0).WithMessage("Client type must be greater than 0");
    }
}

