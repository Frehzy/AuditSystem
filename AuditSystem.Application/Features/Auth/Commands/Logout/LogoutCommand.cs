using AuditSystem.Application.Common.Models;
using AuditSystem.Shared.DTOs.Auth;
using MediatR;
using FluentValidation;
using AuditSystem.Shared.DTOs.Auth.Logout;

namespace AuditSystem.Application.Features.Auth.Commands.Logout;

public class LogoutCommand : IRequest<Result<LogoutResponse>>
{
    public Guid UserId { get; set; } = Guid.Empty;
}

public class LogoutCommandValidator : AbstractValidator<LogoutCommand>
{
    public LogoutCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotNull().WithMessage("Username is required");
    }
}