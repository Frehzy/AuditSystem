using AuditSystem.Application.Common.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace AuditSystem.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid? UserId
    {
        get
        {
            var userIdClaim = httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId)
                ? userId
                : null;
        }
    }

    public string? Username => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
    
    public string? Email => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
    
    public string? Role => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}