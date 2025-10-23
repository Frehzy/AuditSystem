using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Commands;
using AuditSystem.Shared.DTOs.Auth;

namespace AuditSystem.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginCommand command);
    
    Task<Result> ValidateTokenAsync(string token);
}