using AuditSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuditSystem.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<UserEntity> Users { get; }
    
    DbSet<ChatSessionEntity> ChatSessions { get; }
    
    DbSet<ChatMessageEntity> ChatMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}