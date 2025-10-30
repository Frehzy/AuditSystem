using AuditSystem.Application.Common.Models;
using MediatR;
using FluentValidation;

namespace AuditSystem.Application.Features.Auth.Commands.Validate;

public class ValidateCommand : IRequest<Result>
{
    public string Token { get; set; } = string.Empty;
}

public class ValidateCommandValidator : AbstractValidator<ValidateCommand>
{
    public ValidateCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token is required");
    }
}