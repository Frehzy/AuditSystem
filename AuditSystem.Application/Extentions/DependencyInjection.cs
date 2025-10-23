using AuditSystem.Application.Common.Behaviors;
using AuditSystem.Application.Common.Behaviors.Login;
using AuditSystem.Application.Features.Auth.Interfaces;
using AuditSystem.Application.Features.Auth.Services;
using AuditSystem.Application.Mappings;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace AuditSystem.Application.Extentions;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(x => x.AddProfile<MappingProfile>());
        
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        });
        
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}