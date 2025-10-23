using AuditSystem.Application.Common.Interfaces;
using AuditSystem.Domain.Abstractions;
using AuditSystem.Domain.Entities;
using AuditSystem.Domain.Enums;
using AuditSystem.Domain.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace AuditSystem.Infrastructure.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    IPasswordHasher passwordHasher) : DbContext(options), IApplicationDbContext
{
    public DbSet<UserEntity> Users => Set<UserEntity>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        SeedData(modelBuilder, passwordHasher);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
                                   .Where(e => e.Entity is BaseEntity
                                   && (e.State == EntityState.Added
                                   || e.State == EntityState.Modified));
        foreach (var entityEntry in entries.Where(entityEntry => entityEntry.State == EntityState.Added))
            ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;

        return await base.SaveChangesAsync(cancellationToken);
    }

    private static void SeedData(ModelBuilder modelBuilder, IPasswordHasher passwordHasher)
    {
        var hash = passwordHasher.HashPassword("123");
        var adminUser = new UserEntity
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            Email = "admin@localhost",
            PasswordHash = hash,
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        modelBuilder.Entity<UserEntity>().HasData(adminUser);
    }
}