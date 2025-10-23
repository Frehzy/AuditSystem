namespace AuditSystem.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    
    string? Username { get; }
    
    string? Email { get; }
    
    string? Role { get; }
    
    bool IsAuthenticated { get; }
}