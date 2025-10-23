using AuditSystem.Shared.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AuditSystem.Shared.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSharedServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(options =>
        {
            configuration.GetSection("JwtSettings").Bind(options);
            options.Validate();
        });

        services.Configure<CorsSettings>(configuration.GetSection("CorsSettings"));
        services.AddHttpContextAccessor();

        return services;
    }
}