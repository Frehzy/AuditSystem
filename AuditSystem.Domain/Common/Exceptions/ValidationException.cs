using System.Text.Json.Serialization;

namespace AuditSystem.Domain.Common.Exceptions;

public class ValidationException : DomainException
{
    [JsonPropertyName("errors")]
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException() : base("Validation failures have occurred.")
    {
        Errors = [];
    }

    public ValidationException(Dictionary<string, string[]> errors) : this()
    {
        Errors = errors;
    }
}