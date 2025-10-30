using AuditSystem.Application.Common.Models;
using MediatR;
using FluentValidation;

namespace AuditSystem.Application.Features.Auth.Commands.Logout;

public class LogoutCommand : IRequest<Result>
{
    public Guid UserId { get; set; } = Guid.Empty;

    public string Token { get; set; } = string.Empty;
}

public class LogoutCommandValidator : AbstractValidator<LogoutCommand>
{
    public LogoutCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotNull().WithMessage("Username is required");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token is required");
    }
}