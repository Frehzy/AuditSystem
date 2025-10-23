using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Interfaces;
using AuditSystem.Shared.DTOs.Auth;
using AuditSystem.Shared.DTOs.Auth.Logout;
using MediatR;

namespace AuditSystem.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler(IAuthService authService) : IRequestHandler<LogoutCommand, Result<LogoutResponse>>
{
    public async Task<Result<LogoutResponse>> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        return await authService.LogoutAsync(request);
    }
}