using System.Text.Json.Serialization;

namespace AuditSystem.Domain.Abstractions;

public abstract class BaseEntity
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}