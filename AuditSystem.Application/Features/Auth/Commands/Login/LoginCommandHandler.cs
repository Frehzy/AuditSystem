using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Interfaces;
using AuditSystem.Shared.DTOs.Auth;
using AuditSystem.Shared.DTOs.Auth.Login;
using MediatR;

namespace AuditSystem.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(IAuthService authService) : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await authService.LoginAsync(request);
    }
}