using AuditSystem.Domain.Entities;
using System.Security.Claims;

namespace AuditSystem.Domain.Interfaces.Services;

public interface ITokenService
{
    string GenerateToken(UserEntity user);
    
    ClaimsPrincipal? ValidateToken(string token);
}