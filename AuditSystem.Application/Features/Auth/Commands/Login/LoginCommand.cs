using AuditSystem.Application.Common.Models;
using AuditSystem.Shared.DTOs.Auth;
using MediatR;
using FluentValidation;
using AuditSystem.Shared.DTOs.Auth.Login;

namespace AuditSystem.Application.Features.Auth.Commands.Login;

public class LoginCommand : IRequest<Result<LoginResponse>>
{
    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters");
    }
}