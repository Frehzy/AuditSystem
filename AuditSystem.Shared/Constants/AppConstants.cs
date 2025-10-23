namespace AuditSystem.Shared.Constants;

public static class AppConstants
{
    public const int DefaultPageSize = 20;
    
    public const int MaxPageSize = 100;

    public static class Cache
    {
        public const int DefaultExpirationMinutes = 30;
    }

    public static class Validation
    {
        public const int MaxUsernameLength = 50;
        
        public const int MinUsernameLength = 3;
        
        public const int MinPasswordLength = 6;
    }
}