using System.Text.Json.Serialization;

namespace AuditSystem.Shared.DTOs.Auth.Logout;

public class LogoutResponse
{
    [JsonPropertyName("user")]
    public UserDto User { get; set; } = new();
}