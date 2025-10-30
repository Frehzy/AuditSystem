using System.Text.Json.Serialization;

namespace AuditSystem.Shared.DTOs.Auth.Validate;

public class ValidateRequest
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
}