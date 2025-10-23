using System.Text.Json.Serialization;

namespace AuditSystem.Shared.Configuration;

public class JwtSettings
{
    [JsonPropertyName("secret")]
    public string Secret { get; set; } = string.Empty;

    [JsonPropertyName("expiryHours")]
    public int ExpiryHours { get; set; } = 24;

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Secret) || Secret.Length < 32)
            throw new InvalidOperationException("JWT secret must be at least 32 characters long");

        if (ExpiryHours <= 0 || ExpiryHours > 720)
            throw new InvalidOperationException("ExpiryHours must be between 1 and 720");
    }
}