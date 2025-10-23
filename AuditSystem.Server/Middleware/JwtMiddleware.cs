using AuditSystem.Application.Common.Interfaces;
using AuditSystem.Domain.Interfaces.Services;
using AuditSystem.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace AuditSystem.Server.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly JwtSettings _jwtSettings;

    public JwtMiddleware(RequestDelegate next, IOptions<JwtSettings> jwtSettings)
    {
        _next = next;
        _jwtSettings = jwtSettings.Value;
        _jwtSettings.Validate();
    }

    public async Task Invoke(HttpContext context, ITokenService tokenService)
    {
        var token = context.Request.Headers.Authorization.FirstOrDefault()?.Split(" ").Last();

        if (!string.IsNullOrEmpty(token))
        {
            var principal = tokenService.ValidateToken(token);
            if (principal != null)
            {
                context.User = principal;
            }
        }

        await _next(context);
    }
}