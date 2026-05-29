namespace HamzaTex.Api.Services.ViewModel;

public class RegisterDeviceViewModel
{
    public string PushToken { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string? AppVersion { get; set; }
}

public class UnregisterDeviceViewModel
{
    public string PushToken { get; set; } = string.Empty;
}
