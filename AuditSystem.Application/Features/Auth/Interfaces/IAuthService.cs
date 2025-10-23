using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Commands.Login;
using AuditSystem.Application.Features.Auth.Commands.Logout;
using AuditSystem.Shared.DTOs.Auth;
using AuditSystem.Shared.DTOs.Auth.Login;
using AuditSystem.Shared.DTOs.Auth.Logout;

namespace AuditSystem.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginCommand command);

    Task<Result<LogoutResponse>> LogoutAsync(LogoutCommand command);

    Task<Result> ValidateTokenAsync(string token);
}