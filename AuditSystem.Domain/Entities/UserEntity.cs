using AuditSystem.Domain.Abstractions;
using AuditSystem.Domain.Enums;
using System.Text.Json.Serialization;

namespace AuditSystem.Domain.Entities;

public class UserEntity : BaseEntity
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public UserRole Role { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; } = true;

    [JsonPropertyName("lastLoginAt")]
    public DateTime? LastLoginAt { get; set; }

    [JsonPropertyName("chatSessions")]
    public virtual ICollection<ChatSessionEntity> ChatSessions { get; set; } = [];
}
