using AuditSystem.Domain.Common.Exceptions;
using System.Text.Json;

namespace AuditSystem.Server.Middleware;

public class ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = GetStatusCode(exception);
        var response = new
        {
            title = GetTitle(exception),
            status = statusCode,
            detail = exception.Message,
            errors = GetErrors(exception)
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        logger.LogError(exception, "An error occurred: {Message}", exception.Message);

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static int GetStatusCode(Exception exception) =>
        exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            DomainException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

    private static string GetTitle(Exception exception) =>
        exception switch
        {
            ValidationException => "Validation Error",
            DomainException => "Domain Error",
            _ => "Server Error"
        };

    private static Dictionary<string, string[]>? GetErrors(Exception exception)
    {
        if (exception is ValidationException validationException)
            return validationException.Errors;
        return null;
    }
}