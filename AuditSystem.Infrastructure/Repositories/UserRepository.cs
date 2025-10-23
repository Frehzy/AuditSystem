using AuditSystem.Domain.Entities;
using AuditSystem.Domain.Interfaces.Repositories;
using AuditSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuditSystem.Infrastructure.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    public async Task<UserEntity?> GetByIdAsync(Guid id)
    {
        return await context.Users.FindAsync(id);
    }

    public async Task<IEnumerable<UserEntity>> GetAllAsync()
    {
        return await context.Users.ToListAsync();
    }

    public async Task AddAsync(UserEntity entity)
    {
        await context.Users.AddAsync(entity);
    }

    public void Update(UserEntity entity)
    {
        context.Users.Update(entity);
    }

    public void Delete(UserEntity entity)
    {
        context.Users.Remove(entity);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await context.Users.AnyAsync(u => u.Id == id);
    }

    public async Task<UserEntity?> GetByUsernameAsync(string username)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<UserEntity?> GetByEmailAsync(string email)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await context.Users
            .AnyAsync(u => u.Username == username);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await context.Users
            .AnyAsync(u => u.Email == email);
    }
}