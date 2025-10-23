using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using System.Net;
using System.Net.Sockets;

namespace AuditSystem.Server.Services;

public interface IServerInfoService
{
    Task LogServerInfoAsync();
}

public class ServerInfoService(
    IServer server,
    IHostEnvironment environment,
    ILogger<ServerInfoService> logger,
    EndpointDataSource endpointDataSource) : IServerInfoService
{
    public async Task LogServerInfoAsync()
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(1));

            var serverAddresses = server.Features.Get<IServerAddressesFeature>()?.Addresses ?? [];

            logger.LogInformation("╔══════════════════════════════════════════════════════════════╗");
            logger.LogInformation("║                   AuditSystem API Server Started             ║");
            logger.LogInformation("╠══════════════════════════════════════════════════════════════╣");
            logger.LogInformation("║ Environment: {Environment,-45} ║", environment.EnvironmentName);
            logger.LogInformation("║ Application: {Application,-45} ║", environment.ApplicationName);
            
            if (serverAddresses.Any())
            {
                logger.LogInformation("╠══════════════════════════════════════════════════════════════╣");
                logger.LogInformation("║ Listening on:                                                ║");

                foreach (var address in serverAddresses)
                {
                    var uri = new Uri(address);
                    var ipAddress = await GetIpAddressAsync(uri.Host);
                    logger.LogInformation("║   • {Address,-50} ║", $"{uri.Scheme}://{ipAddress}:{uri.Port}");
                }
            }
            
            var endpoints = GetEndpoints();
            if (endpoints.Count != 0)
            {
                logger.LogInformation("╠══════════════════════════════════════════════════════════════╣");
                logger.LogInformation("║ Registered Routes:                                           ║");

                foreach (var endpoint in endpoints)
                {
                    logger.LogInformation("║   • {Method,-8} {Path,-38} ║", endpoint.Method, endpoint.Path);
                }
            }

            logger.LogInformation("╠══════════════════════════════════════════════════════════════╣");
            logger.LogInformation("║ Scalar UI: {ScalarUrl,-40} ║", "Available at /scalar");
            logger.LogInformation("╚══════════════════════════════════════════════════════════════╝");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to log server information");
        }
    }

    private async Task<string> GetIpAddressAsync(string host)
    {
        if (host == "localhost" || host == "127.0.0.1")
            return "localhost";

        if (IPAddress.TryParse(host, out var ipAddress))
        {
            if (ipAddress.AddressFamily == AddressFamily.InterNetworkV6)
                return "localhost";

            return ipAddress.ToString();
        }

        try
        {
            var hostEntry = await Dns.GetHostEntryAsync(host);
            return hostEntry.AddressList.FirstOrDefault()?.ToString() ?? host;
        }
        catch
        {
            return host;
        }
    }

    private List<EndpointInfo> GetEndpoints()
    {
        var endpoints = new List<EndpointInfo>();

        foreach (var endpoint in endpointDataSource.Endpoints)
        {
            var routeEndpoint = endpoint as RouteEndpoint;
            if (routeEndpoint == null) continue;

            var httpMethods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods;
            var method = httpMethods != null ? string.Join(",", httpMethods) : "ANY";
            var path = routeEndpoint.RoutePattern.RawText ?? "/";
            
            if (path.StartsWith("swagger") || path.StartsWith("/swagger"))
                continue;

            endpoints.Add(new EndpointInfo(method, path));
        }
        
        endpoints.Add(new EndpointInfo("GET", "/api/health/db"));
        endpoints.Add(new EndpointInfo("GET", "/api/health"));

        return [.. endpoints
            .DistinctBy(e => e.Path)
            .OrderBy(e => e.Path)
            .ThenBy(e => e.Method)];
    }

    private record EndpointInfo(string Method, string Path);
}