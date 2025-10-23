using System.Text.Json.Serialization;

namespace AuditSystem.Shared.DTOs.Auth;

public class UserDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
}
