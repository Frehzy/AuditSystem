using AuditSystem.Server.Services;

namespace AuditSystem.Server.Extensions;

public static class ServerInfoExtensions
{
    public static IServiceCollection AddServerInfoService(this IServiceCollection services)
    {
        services.AddSingleton<IServerInfoService, ServerInfoService>();
        return services;
    }
}