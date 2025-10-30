using AuditSystem.Application.Common.Interfaces;
using AuditSystem.Application.Common.Models;
using AuditSystem.Application.Features.Auth.Commands.Login;
using AuditSystem.Application.Features.Auth.Commands.Logout;
using AuditSystem.Application.Features.Auth.Commands.Validate;
using AuditSystem.Application.Features.Auth.Interfaces;
using AuditSystem.Domain.Interfaces.Repositories;
using AuditSystem.Domain.Interfaces.Services;
using AuditSystem.Shared.DTOs.Auth;
using AuditSystem.Shared.DTOs.Auth.Login;
using AuditSystem.Shared.DTOs.Auth.Logout;
using AutoMapper;
using System.Security.Claims;

namespace AuditSystem.Application.Features.Auth.Services;

public class AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IMapper mapper,
    IDateTimeService dateTimeService) : IAuthService
{
    public async Task<Result<LoginResponse>> LoginAsync(LoginCommand command)
    {
        var user = await userRepository.GetByUsernameAsync(command.Username);
        if (user == null)
            return Result<LoginResponse>.Fail("Invalid username or password");

        if (!user.IsActive)
            return Result<LoginResponse>.Fail("Account is deactivated");

        if (!passwordHasher.VerifyPassword(command.Password, user.PasswordHash))
            return Result<LoginResponse>.Fail("Invalid username or password");

        // Update last login
        user.LastLoginAt = dateTimeService.UtcNow;
        userRepository.Update(user);

        var token = tokenService.GenerateToken(user);
        var userDto = mapper.Map<UserDto>(user);

        var response = new LoginResponse
        {
            Token = token,
            ExpiresAt = dateTimeService.UtcNow.AddHours(TimeSpan.FromDays(1).Hours),
            User = userDto
        };

        return Result<LoginResponse>.Ok(response);
    }

    public async Task<Result> LogoutAsync(LogoutCommand command)
    {
        var user = await userRepository.GetByIdAsync(command.UserId);
        if (user == null)
            return Result.Fail("Invalid userId");

        if (!user.IsActive)
            return Result.Fail("Account is deactivated");

        user.LastLoginAt = dateTimeService.UtcNow;
        userRepository.Update(user);
        return Result.Ok();
    }

    public async Task<Result> ValidateTokenAsync(ValidateCommand command)
    {
        var principal = tokenService.ValidateToken(command.Token);
        if (principal == null)
            return Result.Fail("Invalid token");

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Result.Fail("Invalid token claims");

        var user = await userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            return Result.Fail("User not found or deactivated");

        return Result.Ok();
    }
}