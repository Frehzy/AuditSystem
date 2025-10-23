namespace AuditSystem.Application.Common.Models;

public class Result
{
    public bool Success { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public List<string> Errors { get; set; } = [];

    public static Result Ok() => new() { Success = true };
    
    public static Result Fail(string message) => new() { Success = false, Message = message };
}

public class Result<T> : Result
{
    public T? Data { get; set; }

    public static Result<T> Ok(T data) => new() { Success = true, Data = data };
    
    public static new Result<T> Fail(string message) => new() { Success = false, Message = message };
}