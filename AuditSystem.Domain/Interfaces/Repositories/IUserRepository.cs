using AuditSystem.Domain.Entities;

namespace AuditSystem.Domain.Interfaces.Repositories;

public interface IUserRepository : IRepository<UserEntity>
{
    Task<UserEntity?> GetByUsernameAsync(string username);
    
    Task<UserEntity?> GetByEmailAsync(string email);
    
    Task<bool> UsernameExistsAsync(string username);
    
    Task<bool> EmailExistsAsync(string email);
}