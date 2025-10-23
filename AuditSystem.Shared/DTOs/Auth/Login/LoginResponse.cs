using System.Text.Json.Serialization;

namespace AuditSystem.Shared.DTOs.Auth.Login;

public class LoginResponse
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
    
    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }
    
    [JsonPropertyName("user")]
    public UserDto User { get; set; } = new();
}