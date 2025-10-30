using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Commands.Login;
using AuditSystem.Application.Features.Auth.Commands.Logout;
using AuditSystem.Application.Features.Auth.Commands.Validate;
using AuditSystem.Shared.DTOs.Auth.Login;

namespace AuditSystem.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginCommand command);

    Task<Result> LogoutAsync(LogoutCommand command);

    Task<Result> ValidateTokenAsync(ValidateCommand token);
}