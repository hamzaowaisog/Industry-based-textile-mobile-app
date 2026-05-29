namespace HamzaTex.Api.Models;

public class RegisterDeviceDto
{
    public string PushToken { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string? AppVersion { get; set; }
}

public class DeviceTokenDto
{
    public int Id { get; set; }
    public string PushToken { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public bool IsActive { get; set; }
}

public class UnregisterDeviceDto
{
    public string PushToken { get; set; } = string.Empty;
}
