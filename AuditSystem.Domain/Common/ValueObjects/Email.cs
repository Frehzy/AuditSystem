using System.Text.Json.Serialization;

namespace AuditSystem.Domain.Common.ValueObjects;

public class Email
{
    [JsonPropertyName("value")]
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty");

        if (!IsValidEmail(value))
            throw new ArgumentException("Invalid email format");

        Value = value.Trim().ToLower();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    public override string ToString() => Value;

    public static implicit operator string(Email email) => email.Value;
}