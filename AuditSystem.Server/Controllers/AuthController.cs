using AuditSystem.Application.Features.Auth.Commands;
using AuditSystem.Application.Features.Auth.Commands.Login;
using AuditSystem.Application.Features.Auth.Commands.Logout;
using AuditSystem.Application.Features.Auth.Commands.Validate;
using AuditSystem.Application.Features.Auth.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuditSystem.Server.Controllers;

public class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await authService.LoginAsync(command);
        return HandleResult(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutCommand command)
    {
        var result = await authService.LogoutAsync(command);
        return HandleResult(result);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateToken([FromBody] ValidateCommand command)
    {
        var result = await authService.ValidateTokenAsync(command);
        return HandleResult(result);
    }
}