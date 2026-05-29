namespace HamzaTex.Api.Entities;

public class DeviceToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string PushToken { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty; // "ios" or "android"
    public string? AppVersion { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ApplicationUser User { get; set; } = null!;
}
