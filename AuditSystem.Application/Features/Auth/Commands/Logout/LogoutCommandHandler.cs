using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Interfaces;
using MediatR;

namespace AuditSystem.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler(IAuthService authService) : IRequestHandler<LogoutCommand, Result>
{
    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        return await authService.LogoutAsync(request);
    }
}