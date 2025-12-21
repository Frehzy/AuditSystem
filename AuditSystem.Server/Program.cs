using AuditSystem.Application.Extentions;
using AuditSystem.Infrastructure.Data;
using AuditSystem.Infrastructure.Extentions;
using AuditSystem.Server.Configuration;
using AuditSystem.Server.Extensions;
using AuditSystem.Server.Middleware;
using AuditSystem.Server.Services;
using AuditSystem.Shared.Configuration;
using AuditSystem.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi(options =>
{
    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;
});

builder.Services.AddCors(options =>
{
    var corsSettings = builder.Configuration.GetSection("CorsSettings").Get<CorsSettings>()
    ?? throw new ArgumentNullException(nameof(CorsSettings), "Некорректная конфигурация сервера");
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsSettings.AllowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSharedServices(builder.Configuration);

builder.Services.AddHealthChecks()
    .AddCheck("api", () => HealthCheckResult.Healthy("API is running"))
    .AddDbContextCheck<ApplicationDbContext>();

builder.Services.AddServerInfoService();

builder.Services.Configure<ApiConfiguration>(builder.Configuration.GetSection("ApiConfiguration"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionHandlerMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<JwtMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapHealthChecks("/api/health/db");
app.MapHealthChecks("/api/health");

app.MapFallbackToFile("/index.html");

try
{
    Log.Information("Starting AuditSystem API Server...");

    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (builder.Environment.IsDevelopment())
    {
        await context.Database.EnsureDeletedAsync();
        Log.Information("Database deleted in DEBUG mode.");
    }

    if (await context.Database.CanConnectAsync())
    {
        Log.Information("Database exists and is accessible.");
    }
    else
    {
        Log.Warning("Database does not exist or is not accessible. Attempting to create...");

        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            Log.Information("Applying migrations...");
            await context.Database.MigrateAsync();
            Log.Information("Migrations applied successfully.");
        }
        else
        {
            Log.Information("No migrations found. Creating database from models...");
            await context.Database.EnsureCreatedAsync();
            Log.Information("Database created from models.");
        }
    }

    await app.StartAsync();

    if (builder.Environment.IsDevelopment())
    {
        var serverInfoService = app.Services.GetRequiredService<IServerInfoService>();
        await serverInfoService.LogServerInfoAsync();
    }

    Log.Information("AuditSystem API Server started successfully");

    await app.WaitForShutdownAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.Information("AuditSystem API Server is shutting down...");
    Log.CloseAndFlush();
}