using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Interfaces;
using AuditSystem.Shared.DTOs.Auth;
using AuditSystem.Shared.DTOs.Auth.Validate;
using MediatR;

namespace AuditSystem.Application.Features.Auth.Commands.Validate;

public class ValidateCommandHandler(IAuthService authService) : IRequestHandler<ValidateCommand, Result>
{
    public async Task<Result> Handle(ValidateCommand request, CancellationToken cancellationToken)
    {
        return await authService.ValidateTokenAsync(request);
    }
}