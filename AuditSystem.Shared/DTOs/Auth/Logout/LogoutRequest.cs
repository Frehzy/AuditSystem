using System.Text.Json.Serialization;

namespace AuditSystem.Shared.DTOs.Auth.Logout;

public class LogoutRequest
{
    [JsonPropertyName("userId")]
    public Guid UserId { get; set; } = Guid.Empty;
}