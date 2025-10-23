namespace AuditSystem.Server.Configuration;

public class ApiConfiguration
{
    public string ApplicationName { get; set; } = "AuditSystem API";
    
    public string Version { get; set; } = "1.0.0";
    
    public bool UseSwagger { get; set; } = false;
}